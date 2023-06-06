# Optional: custom build of `canvaskit-wasm` to increase compatibility with older devices

On some older Android devices, text drawn with `canvaskit-wasm` is sometimes distorted. The problem looks identical to the issue raised at https://github.com/flutter/flutter/issues/75327. It is related to a bug in some Adreno GPUs, because it is referenced in a fix at https://skia-review.googlesource.com/c/skia/+/571418/, which is part of `canvaskit-wasm` 0.36.1. Unfortunately, we have noticed the same bug in other older GPUs, and the fix is not applied to them. A more aggresive solution is to apply the fix to _all_ GPUs. While this reduces performance, our use case is relatively light on the GPU, and thus we make this tradeoff because we prioritize compatibility with all devices. To do this, we must modify skia's C++ code.

These steps are optional, but if you observe text distortion, you can make a custom build of `canvaskit-wasm`. The following has been verified to work in WSL-Ubuntu:

1. Clone the repository from within your home directory: `git clone https://github.com/google/skia.git`

2. Optional: To build from a specific release of `canvaskit-wasm`, rather than the most recent skia commits, checkout the commit from that release. For example, `canvaskit-wasm` 0.38.1 was deployed from commit 644e199. To use this: `git -C ~/skia checkout 644e199`

3. One of the docker files refers to an image in an inaccessible registry. Edit the file `~/skia/infra/canvaskit/docker/canvaskit-emsdk/Dockerfile` and change the line that says

```
FROM gcr.io/skia-public/emsdk-base:3.1.26_v2
```

to

```
FROM emsdk-base
```

4. Edit the skia C++ code to apply the fix to all GPUs. Edit the file `~/skia/src/gpu/ganesh/gl/GrGLCaps.cpp` and comment out the code that limits the fix to only certain GPUs. Change

```
    if (ctxInfo.renderer()      == GrGLRenderer::kWebGL &&
        (ctxInfo.webglRenderer() == GrGLRenderer::kAdreno4xx_other ||
         ctxInfo.webglRenderer() == GrGLRenderer::kAdreno630)) {
        fFlushBeforeWritePixels = true;
    }
```

to

```
    //if (ctxInfo.renderer()      == GrGLRenderer::kWebGL &&
    //    (ctxInfo.webglRenderer() == GrGLRenderer::kAdreno4xx_other ||
    //     ctxInfo.webglRenderer() == GrGLRenderer::kAdreno630)) {
        fFlushBeforeWritePixels = true;
    //}
```

5. Run the following commands:

```
docker build -t emsdk-base ~/skia/infra/wasm-common/docker/emsdk-base/
docker run -v ~/skia:/SRC -v ~/skia/out/dockerpathkit:/OUT emsdk-base /SRC/infra/pathkit/build_pathkit.sh
docker build -t canvaskit-emsdk ./skia/infra/canvaskit/docker/canvaskit-emsdk/
docker run -a stdout -v ~/skia:/SRC -w /SRC emsdk-base python3 tools/git-sync-deps
docker run -v ~/skia:/SRC -v ~/skia/out:/OUT canvaskit-emsdk /SRC/infra/canvaskit/build_canvaskit.sh
```

Note 1: If you have previously built `canvaskit-wasm`, remove existing docker images for `canvaskit-emsdk` and `emsdk-base`.

Note 2: In the last step, alternatively use `docker run -v ~/skia:/SRC -v ~/skia/out:/OUT canvaskit-emsdk /SRC/infra/canvaskit/build_canvaskit.sh debug_build` to build a debug version of `canvaskit-wasm`, which will create a non-minified version of `canvaskit.js` and a wasm binary with full features. This is practical only for debugging, because the wasm binary is much larger (over _100 megabytes_) than the release version.

6. The build artifacts of interest, `canvaskit.js` and `canvaskit.wasm`, are in `~/skia/out`. Assuming you have already executed `npm install`, replace the same two files in `node_modules/canvaskit-wasm/bin` with these newly built files. Before replacing the files, rename the originals so you can easily switch back, if needed. Note: you must replace both `canvaskit.js` and `canvaskit.wasm` -- you cannot simply replace the wasm file.
