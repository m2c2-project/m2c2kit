using System;
using System.IO;
using System.Collections.Generic;
using MimeTypes;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using System.Text;
using Azure.Storage.Blobs.Models;
using Azure;

namespace DemoServer
{
    public class DemoServer
    {
        private const string containerName = "m2c2studyresources";
        private readonly ILogger<DemoServer> _logger;

        public DemoServer(ILogger<DemoServer> log)
        {
            _logger = log;
        }

        /**
        * This get endpoint is to serve content to a browser
        * The wildcard on *filename means that the rest of the path will be assigned to the filename parameter,
        * even if the path contains slashes. This allows us to serve nested resources within folders.
        */
        [FunctionName("get")]
        public async Task<IActionResult> Get(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "studies/{studyCode}/{*filename}")] HttpRequest req,
            string studyCode, string filename)
        {
            _logger.LogInformation($"get request for {studyCode}, filename {filename}");

            if (string.IsNullOrEmpty(studyCode))
            {
                return new BadRequestResult();
            }

            if (string.IsNullOrEmpty(filename))
            {
                return new LocalRedirectResult($"/studies/{studyCode}/index.html", true, true);
            }

            if (filename.EndsWith("/"))
            {
                return new LocalRedirectResult($"/studies/{studyCode}/{filename}index.html", true, true);
            }

            var containerClient = GetBlobContainerClient();

            try
            {
                var stream = await GetFileAsStreamFromStorage(studyCode, filename, containerClient);
                return new FileStreamResult(stream, MimeTypeMap.GetMimeType(Path.GetExtension(filename)));
            }
            catch (Exception ex)
            {
                // maybe this was a subfolder; does there exist an index.html off it?
                if (await FileExists(studyCode, filename + "/index.html", containerClient))
                {
                    return new LocalRedirectResult($"/studies/{studyCode}/{filename}/index.html", true, true);
                }
                return new BadRequestObjectResult(ex);
            }
        }

        /**
        * This will return a StudyResources object, which lists all the files needed
        * for the study: their name, md5 hash, and last modified
        */
        [FunctionName("getStudyResources")]
        public async Task<IActionResult> GetStudyResources(
           [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "api/studies/{studyCode}/resources")] HttpRequest req,
           string studyCode)
        {
            _logger.LogInformation($"resources request for study {studyCode}");
            var containerClient = GetBlobContainerClient();

            try
            {
                var blobNames = await ListBlobsHierarchicalListing(containerClient, $"studies/{studyCode}", 250);
                var resources = new StudyResources();

                foreach (var blobName in blobNames)
                {
                    var blobClient = containerClient.GetBlobClient(blobName);
                    var blobProperties = await blobClient.GetPropertiesAsync();
                    var modified = blobProperties.Value.LastModified.ToUnixTimeSeconds();
                    var md5 = Convert.ToHexString(blobProperties.Value.ContentHash);
                    var filename = removeFromBeginningOfString(blobName, $"studies/{studyCode}/");
                    var fileResource = new FileResource() { Filename = filename, Md5 = md5, Modified = modified };
                    resources.FileResources.Add(fileResource);
                }
                return new OkObjectResult(resources);
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(ex);
            }
        }

        /**
        * This download endpoint will send a file
        * The wildcard on *filename means that the rest of the path will be assigned to the filename parameter,
        * even if the path contains slashes. This allows us to send nested resources within folders.
        */
        [FunctionName("download")]
        public async Task<IActionResult> Download(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "api/studies/{studyCode}/files/{*filename}")] HttpRequest req,
            string studyCode, string filename)
        {
            _logger.LogInformation($"download request for study {studyCode}, file {filename}");
            var containerClient = GetBlobContainerClient();

            try
            {
                var stream = await GetFileAsStreamFromStorage(studyCode, filename, containerClient);
                return new FileStreamResult(stream, MimeTypeMap.GetMimeType(Path.GetExtension(filename))) { FileDownloadName = Path.GetFileName(filename) };
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(ex);
            }
        }

        /**
        * This post endpoint allows uploading a file to the study.
        * Request must be authenticated with Basic authentication
        */
        [FunctionName("upload")]
        public async Task<IActionResult> UploadFile(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "api/studies/{studyCode}/files")] HttpRequest req,
            string studyCode)
        {
            _logger.LogInformation($"upload request for study {studyCode}");

            if (!isAuthorized(req))
            {
                return new UnauthorizedResult();
            }
            var containerClient = GetBlobContainerClient();

            try
            {
                var formdata = await req.ReadFormAsync();

                var pathWithTrailingSlash = "";
                if (formdata.ContainsKey("folder"))
                {
                    pathWithTrailingSlash = formdata["folder"];
                    if (string.IsNullOrEmpty(pathWithTrailingSlash))
                    {
                        pathWithTrailingSlash = "";
                    }
                    else
                    {
                        pathWithTrailingSlash = pathWithTrailingSlash + "/";
                    }
                }

                foreach (var file in req.Form.Files)
                {
                    var blobClient = containerClient.GetBlobClient($"studies/{studyCode}/{pathWithTrailingSlash}{file.FileName}");
                    await blobClient.UploadAsync(file.OpenReadStream(), true);
                }
                return new OkObjectResult("OK");
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(ex);
            }
        }

        private static bool isAuthorized(HttpRequest req)
        {
            var providedUserPwBase64 = req?.Headers["Authorization"].ToString()?.Replace("Basic", "")?.Replace("basic", "")?.Trim();
            if (providedUserPwBase64 is null)
            {
                return false;
            }
            var providedUserPw = Encoding.UTF8.GetString(Convert.FromBase64String(providedUserPwBase64));
            var userPw = Environment.GetEnvironmentVariable("basicAuthUserPw");
            return providedUserPw == userPw;
        }

        private static BlobContainerClient GetBlobContainerClient()
        {
            var storageConnectionString = Environment.GetEnvironmentVariable("storageConnectionString");
            var blobServiceClient = new BlobServiceClient(storageConnectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            containerClient.CreateIfNotExists();
            return containerClient;
        }

        private static async Task<Stream> GetFileAsStreamFromStorage(string studyCode, string filename, BlobContainerClient containerClient)
        {
            var blobClient = containerClient.GetBlobClient($"studies/{studyCode}/{filename}");
            var stream = await blobClient.OpenReadAsync();
            return stream;
        }

        private static async Task<bool> FileExists(string studyCode, string filename, BlobContainerClient containerClient)
        {
            var blobClient = containerClient.GetBlobClient($"studies/{studyCode}/{filename}");
            return await blobClient.ExistsAsync();
        }

        private static string removeFromBeginningOfString(string s, string search)
        {
            var pos = s.IndexOf(search);
            if (pos != 0)
            {
                return s;
            }
            return s.Substring(search.Length);
        }

        // from https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-list?tabs=dotnet
        private static async Task<List<string>> ListBlobsHierarchicalListing(BlobContainerClient container,
                                                               string? prefix,
                                                               int? segmentSize, List<String>? blobNames = null)
        {
            if (blobNames == null)
            {
                blobNames = new List<string>();
            }
            try
            {
                // Call the listing operation and return pages of the specified size.
                var resultSegment = container.GetBlobsByHierarchyAsync(prefix: prefix, delimiter: "/")
                    .AsPages(default, segmentSize);

                // Enumerate the blobs returned for each page.
                await foreach (Azure.Page<BlobHierarchyItem> blobPage in resultSegment)
                {
                    // A hierarchical listing may return both virtual directories and blobs.
                    foreach (BlobHierarchyItem blobhierarchyItem in blobPage.Values)
                    {
                        if (blobhierarchyItem.IsPrefix)
                        {
                            // Call recursively with the prefix to traverse the virtual directory.
                            await ListBlobsHierarchicalListing(container, blobhierarchyItem.Prefix, null, blobNames);
                        }
                        else
                        {
                            // Save the name of the blob in the list
                            blobNames.Add(blobhierarchyItem.Prefix + blobhierarchyItem.Blob.Name);
                        }
                    }
                }
            }
            catch (RequestFailedException e)
            {
                throw new Exception($"Exception listing blobs: {e.Message}");
            }
            return blobNames;
        }
    }
}
