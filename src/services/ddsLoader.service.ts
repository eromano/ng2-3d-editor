/* porting three.js/examples/js/loaders/DDSLoader.js @author mrdoob / http://mrdoob.com/ */

import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable()
export class DdsLoaderService extends THREE.CompressedTextureLoader {

    parse(buffer, loadMipmaps) {
        let dds: any = {mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1};

        // Adapted from @toji's DDS utils
        // https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

        // All values and structures referenced from:
        // http://msdn.microsoft.com/en-us/library/bb943991.aspx/

        let DDS_MAGIC = 0x20534444;

        let DDSD_MIPMAPCOUNT = 0x20000;

        let DDSCAPS2_CUBEMAP = 0x200,
            DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
            DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
            DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
            DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
            DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
            DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;

        let DDPF_FOURCC = 0x4;

        let FOURCC_DXT1 = this.fourCCToInt32('DXT1');
        let FOURCC_DXT3 = this.fourCCToInt32('DXT3');
        let FOURCC_DXT5 = this.fourCCToInt32('DXT5');
        let FOURCC_ETC1 = this.fourCCToInt32('ETC1');

        let headerLengthInt = 31; // The header length in 32 bit ints

        // Offsets into the header array

        let offMagic = 0;

        let offSize = 1;
        let offFlags = 2;
        let offHeight = 3;
        let offWidth = 4;

        let offMipmapCount = 7;

        let offPfFlags = 20;
        let offPfFourCC = 21;
        let offRGBBitCount = 22;
        let offRBitMask = 23;
        let offGBitMask = 24;
        let offBBitMask = 25;
        let offABitMask = 26;

        let offCaps = 28;

        // Parse header

        let header: any = new Int32Array(buffer, 0, headerLengthInt);

        if (header[offMagic] !== DDS_MAGIC) {
            console.error('THREE.DDSLoader.parse: Invalid magic number in DDS header.');
            return dds;
        }

        if (!header[offPfFlags] && DDPF_FOURCC) {
            console.error('THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.');
            return dds;
        }

        let blockBytes;

        let fourCC = header[offPfFourCC];

        let isRGBAUncompressed = false;

        switch (fourCC) {
            case FOURCC_DXT1:

                blockBytes = 8;
                dds.format = THREE.RGB_S3TC_DXT1_Format;
                break;

            case FOURCC_DXT3:

                blockBytes = 16;
                dds.format = THREE.RGBA_S3TC_DXT3_Format;
                break;

            case FOURCC_DXT5:

                blockBytes = 16;
                dds.format = THREE.RGBA_S3TC_DXT5_Format;
                break;

            case FOURCC_ETC1:

                blockBytes = 8;
                dds.format = THREE.RGB_ETC1_Format;
                break;

            default:

                if (header[offRGBBitCount] === 32
                    && header[offRBitMask] & 0xff0000
                    && header[offGBitMask] & 0xff00
                    && header[offBBitMask] & 0xff
                    && header[offABitMask] & 0xff000000) {
                    isRGBAUncompressed = true;
                    blockBytes = 64;
                    dds.format = THREE.RGBAFormat;

                } else {
                    console.error('THREE.DDSLoader.parse: Unsupported FourCC code ', this.int32ToFourCC(fourCC));
                    return dds;

                }
        }

        dds.mipmapCount = 1;

        if (header[offFlags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {
            dds.mipmapCount = Math.max(1, header[offMipmapCount]);
        }

        let caps2 = header[offCaps];
        dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;
        if (dds.isCubemap && (
                !( caps2 & DDSCAPS2_CUBEMAP_POSITIVEX ) ||
                !( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX ) ||
                !( caps2 & DDSCAPS2_CUBEMAP_POSITIVEY ) ||
                !( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY ) ||
                !( caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ ) ||
                !( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ )
            )) {
            console.error('THREE.DDSLoader.parse: Incomplete cubemap faces');
            return dds;
        }

        dds.width = header[offWidth];
        dds.height = header[offHeight];

        let dataOffset = header[offSize] + 4;

        // Extract mipmaps buffers

        let faces = dds.isCubemap ? 6 : 1;

        for (let face = 0; face < faces; face++) {
            let width = dds.width;
            let height = dds.height;

            for (let i = 0; i < dds.mipmapCount; i++) {
                let dataLength;
                let byteArray;

                if (isRGBAUncompressed) {
                    byteArray = this.loadARGBMip(buffer, dataOffset, width, height);
                    dataLength = byteArray.length;

                } else {
                    dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
                    byteArray = new Uint8Array(buffer, dataOffset, dataLength);

                }

                let mipmap = {'data': byteArray, 'width': width, 'height': height};
                dds.mipmaps.push(mipmap);

                dataOffset += dataLength;

                width = Math.max(width >> 1, 1);
                height = Math.max(height >> 1, 1);

            }
        }

        return dds;
    }

    fourCCToInt32(value) {
        return value.charCodeAt(0) +
            ( value.charCodeAt(1) << 8 ) +
            ( value.charCodeAt(2) << 16 ) +
            ( value.charCodeAt(3) << 24 );
    }

    int32ToFourCC(value) {
        return String.fromCharCode(
            value & 0xff,
            ( value >> 8 ) & 0xff,
            ( value >> 16 ) & 0xff,
            ( value >> 24 ) & 0xff
        );
    }

    loadARGBMip(buffer, dataOffset, width, height) {
        let dataLength = width * height * 4;
        let srcBuffer = new Uint8Array(buffer, dataOffset, dataLength);
        let byteArray = new Uint8Array(dataLength);
        let dst = 0;
        let src = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let b = srcBuffer[src];
                src++;
                let g = srcBuffer[src];
                src++;
                let r = srcBuffer[src];
                src++;
                let a = srcBuffer[src];
                src++;
                byteArray[dst] = r;
                dst++;	//r
                byteArray[dst] = g;
                dst++;	//g
                byteArray[dst] = b;
                dst++;	//b
                byteArray[dst] = a;
                dst++;	//a

            }

        }
        return byteArray;
    }
}
