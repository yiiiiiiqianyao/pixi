import { Assets, Texture } from "pixi.js";


interface ITextureParams {
    suffix?: string;
}

function isSuffixSupport(url: string) {
    // avif, webp, png, jpg, gif
    ['.avif', '.webp', '.png', '.jpg', '.gif'].forEach(suffix => {
        if(url.endsWith(suffix)) {
            return true;
        }
    })
    return false;
}

export class TexturePool {
    private static texturePool: Map<string, Texture> = new Map();
    private static textureMap: Map<string, string> = new Map();
    static async loadTexture(url: string, params: ITextureParams = {}) { 
        const { suffix = '.jpg' } = params;    
        let textureURL = url;   
        if(!isSuffixSupport(textureURL)) {
            textureURL += suffix;
        }
        TexturePool.textureMap.set(url, textureURL);

        let isLoadSuccess = true;
        if(TexturePool.texturePool.has(textureURL)) return isLoadSuccess;
        try {
            const texture = await Assets.load<Texture>(textureURL);
            TexturePool.texturePool.set(textureURL, texture);
        } catch(err) {
            console.warn('texture load error', err, textureURL);
            isLoadSuccess = false;
        }
        return isLoadSuccess;
    }
  
    static getTexture(url: string) {
        const textureURL = TexturePool.textureMap.get(url) as string;
        return TexturePool.texturePool.get(textureURL) as Texture;
    }
  }
  