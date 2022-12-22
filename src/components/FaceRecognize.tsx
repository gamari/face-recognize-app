import React, { useEffect, useRef, useState } from "react";
import { getImageSize } from "react-image-size";
import * as faceapi from "face-api.js";

const FaceRecognize = () => {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [imageUrl, setUrl] = useState(
    "https://images.pexels.com/photos/2705089/pexels-photo-2705089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  );
  const [targetUrl, setTargetUrl] = useState("");

  const [faceNum, setFaceNum] = useState(0);

  const imgRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImage = async () => {
    if (imgRef.current && canvasRef.current) {
      const detections = await faceapi
        .detectAllFaces(imgRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      console.log(detections);
      setFaceNum(detections.length);

      faceapi.matchDimensions(canvasRef.current, {
        width: width,
        height: height,
      });

      const resize = faceapi.resizeResults(detections, {
        width: width,
        height: height,
      });

      faceapi.draw.drawDetections(canvasRef.current, resize);
    }
  };

  /** 画像を読み込んで画像サイズを取得する。 */
  const loadImage = async (url: string) => {
    const { width, height } = await getImageSize(url);
    setWidth(width);
    setHeight(height);
  };

  // Handles
  /** 顔認識。 */
  const recognizeFace = () => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]).then(handleImage);
    };

    console.log("顔認識...");
    imgRef?.current && width != 0 && height != 0 && loadModels();
  };

  /** 画像読み込み。 */
  const handleLoadImage = () => {
    if (!targetUrl) {
      return;
    }

    setUrl(targetUrl);
    loadImage(targetUrl);
  };

  useEffect(() => {
    loadImage(imageUrl);
  }, []);

  return (
    <div className="flex">
      <div className="relative">
        <img
          crossOrigin="anonymous"
          src={imageUrl}
          ref={imgRef}
          width={width}
          height={height}
          className="z-10"
        />

        <canvas
          width={width}
          height={height}
          ref={canvasRef}
          className="absolute top-0 left-0 z-20 bg-transparent"
        ></canvas>
      </div>

      <div className="p-4">
        {/* Input */}
        <div>
          <h2 className="text-xl font-bold">操作一覧</h2>

          <div className="flex flex-row p-2">
            <div className="px-3 py-2 border rounded-full">URL形式</div>
            <div className="px-3 py-2 border rounded-full">
              画像アップロード
            </div>
          </div>

          <div>
            <div className="flex mb-2">
              <input
                type="text"
                className="px-3 py-2 border"
                onChange={(e) => setTargetUrl(e.target.value)}
              />
              <button
                onClick={handleLoadImage}
                className="px-3 py-2 text-white bg-orange-600 border"
              >
                画像読み込み
              </button>
            </div>
          </div>
        </div>

        <div>
          {width != 0 && height != 0 && (
            <button
              className="px-3 py-2 text-white bg-blue-600 border"
              onClick={recognizeFace}
            >
              顔読み込み
            </button>
          )}

          <div className="mt-4">
            <div className="text-xl font-bold">画像情報</div>
            <div className="p-4">
              <div>横幅：{width}px</div>
              <div>縦幅：{height}px</div>
              <div>認識した人数：{faceNum}人</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognize;
