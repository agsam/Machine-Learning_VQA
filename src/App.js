import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { getInference, loadModelPromise } from "./model";
import { CANVAS_SIZE, IMAGE_SIZE } from "./constants";
import { randint } from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const no_of_images = 15;

const SAMPLE_QUESTIONS = [
  "What color is the shape?",
  "Is there a blue shape in the image?",
  "Is there a red shape?",
  "Is there a green shape in the image?",
  "Is there a black shape?",
  "Is there not a teal shape in the image?",
  "Does the image contain a rectangle?",
  "Does the image not contain a circle?",
  "What shape is present?",
  "Is no triangle present?",
  "Is a circle present?",
  "Is a rectangle present?",
  "Is there a triangle?",
  "What is the color of the shape?",
  "What shape does the image contain?",
];

const randomQuestion = () =>
  SAMPLE_QUESTIONS[randint(0, SAMPLE_QUESTIONS.length - 1)];

const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.has("embed");

function App() {
  const [question, setQuestion] = useState(randomQuestion());
  const [answer, setAnswer] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const mainCanvas = useRef(null);
  const smallCanvas = useRef(null);
  const onPredict = useCallback(() => {
    setPredicting(true);
  }, [setPredicting]);

  useEffect(() => {
    if (smallCanvas.current) {
      const ctx = smallCanvas.current.getContext("2d");
      const ratio = IMAGE_SIZE / CANVAS_SIZE;
      ctx.scale(ratio, ratio);
    }
  }, [smallCanvas]);

  useEffect(() => {
    if (predicting) {
      // Draw the main canvas to our smaller, correctly-sized canvas
      const ctx = smallCanvas.current.getContext("2d");
      ctx.drawImage(mainCanvas.current, 0, 0);

      getInference(smallCanvas.current, question).then((answer) => {
        setAnswer(answer);
        setPredicting(false);
      });
    }
  }, [predicting, question]);

  const onQuestionChange = useCallback(
    (e) => {
      setQuestion(e.target.value);
      setAnswer(null);
    },
    [setQuestion]
  );

  const randomizeImage = useCallback(() => {
    const context = mainCanvas.current.getContext("2d");
    const img = new Image();
    let random_number = randint(1, no_of_images);
    // document.querySelector("#imageName").value = random_number;
    let image_path = "/images/" + random_number + ".png";
    img.src = image_path;
    img.onload = () => {
      context.drawImage(img, 0, 0, img.width, img.height, 0, 0, 255, 255);
    };
    setAnswer(null);
  }, [mainCanvas]);

  const uploadImage = useCallback(() => {
    const context = mainCanvas.current.getContext("2d");
    const img = new Image();

    let image_path =
      "/images/" + document.querySelector("#imageName").value + ".png";
    console.log(image_path);
    img.src = image_path;
    img.onload = () => {
      context.drawImage(img, 0, 0, img.width, img.height, 0, 0, 255, 255);
    };
    setAnswer(null);
  }, [mainCanvas]);

  const randomizeQuestion = useCallback(() => {
    let q = question;
    while (q === question) {
      q = randomQuestion();
    }
    setQuestion(q);
    setAnswer(null);
  }, [question, setQuestion]);

  useEffect(() => {
    randomizeImage();

    loadModelPromise.then(() => {
      setModelLoaded(true);
    });
  }, [randomizeImage]);

  return (
    <div className="root container">
      <div className="app-container">
        {!isEmbedded && (
          <>
            <h1>Visual QA</h1>
            <p className="description">
              <h3>CS314b:Machine Learning</h3>
              <b>Created by Rohan, Rishav and Abhishek.</b>
            </p>
            <hr></hr>
            <hr style={{ marginTop: "-10px" }}></hr>
          </>
        )}
        <div className="container" style={{ marginTop: "20px" }}>
          <div style={{ border: "1px solid gray" }}>
            <canvas ref={mainCanvas} width={CANVAS_SIZE} height={CANVAS_SIZE} />
            <canvas
              ref={smallCanvas}
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              style={{ display: "none" }}
            />
            <br />
            {/* <p>Want a different image?</p> */}
          </div>
          <div style={{ marginLeft: "25px" }}>
            <p>
              Enter the name of any png image present in the /public/images
              directory.
            </p>
            <input
              className="inputTag"
              type="text"
              id="imageName"
              name="imageName"
              placeholder="Image Name"
              style={{ width: 247 }}
            />
            <Button
              onClick={uploadImage}
              disabled={predicting}
              style={{ marginLeft: "5px" }}
            >
              Upload Image
            </Button>
            <Button
              onClick={randomizeImage}
              disabled={predicting}
              style={{ marginLeft: "5px" }}
            >
              Random Image
            </Button>
            <br />
            <br />
            <input
              className="inputTag"
              style={{ width: 350 }}
              as="textarea"
              placeholder={SAMPLE_QUESTIONS[0]}
              value={question}
              onChange={onQuestionChange}
              disabled={predicting}
            />
            <Button
              onClick={randomizeQuestion}
              style={{ marginLeft: 10 }}
              disabled={predicting}
            >
              Random Question
            </Button>
            <p></p>
            <br></br>
            <Button
              variant="success"
              size="lg"
              onClick={onPredict}
              disabled={!modelLoaded || predicting}
              style={{ float: "right" }}
            >
              {modelLoaded
                ? predicting
                  ? "Predicting..."
                  : "Predict"
                : "Loading model..."}
            </Button>
            <div style={{ width: 400, overflow: "hidden" }}>
              {!!answer ? (
                <Alert variant="primary">
                  Prediction: <b>{answer}</b>
                </Alert>
              ) : predicting ? (
                <Alert variant="light">
                  The prediction will appear here soon...
                </Alert>
              ) : (
                <Alert variant="light">Click Predict!</Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
