using System.Collections.Generic;

public class StudyResources
{
    public List<FileResource> FileResources { get; set; } = new List<FileResource>();
}

public class FileResource
{
    public string Filename { get; set; } = "";
    // Why MD5?
    // 1 - We're using this for checking file integrity, not for cryptographic purposes
    // 2 - Azure Blob Storage automatically stores MD5, so we don't have to calculate
    public string Md5 { get; set; } = "";
    public long Modified { get; set; } = 0;
}