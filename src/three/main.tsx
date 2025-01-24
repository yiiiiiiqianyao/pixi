import React, { useEffect, useRef } from 'react';
import './main.css';
import { SceneManager } from './sceneManager';

function Main() {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!containerRef.current) return;
        const sceneManager = new SceneManager(containerRef.current);      

        return () => {
            // 清理操作
            containerRef.current?.removeChild(sceneManager.renderer.domElement);
        };
    }, []);
    return <div ref={containerRef} />;
}

export default Main;
export {};