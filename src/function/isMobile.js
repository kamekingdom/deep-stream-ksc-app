import { useState, useEffect } from 'react';

function useIsMobileByRatio() {
    const calculateAspectRatio = () => window.innerWidth / window.innerHeight;

    // 初期値としてアスペクト比を計算
    const [aspectRatio, setAspectRatio] = useState(calculateAspectRatio());

    useEffect(() => {
        const handleResize = () => {
            setAspectRatio(calculateAspectRatio());
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // アスペクト比が1より小さい場合、それは縦長の画面と判断し、スマートフォンとみなす。
    return aspectRatio < 1;
}

export default useIsMobileByRatio;
