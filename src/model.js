import * as tf from "@tensorflow/tfjs";

import { WORD_INDEX, ANSWERS } from "./constants";

export const loadModelPromise = tf
  .loadLayersModel("/model.json")
  .then((model) => {
    return model;
  });

function getBagOfWords(str) {
  str = str
    .trim()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

  // We have to add 1 to maintain consistency with how the BOW vectors are
  // generated in our Python implementation. See easy-VQA-keras for more.
  const bagOfWords = Array(Object.keys(WORD_INDEX).length + 1).fill(0);

  const tokens = str.split(" ");
  tokens.forEach((token) => {
    if (token in WORD_INDEX) {
      bagOfWords[WORD_INDEX[token]] += 1;
    }
  });
  return bagOfWords;
}

export async function getInference(imageData, question) {
  const questionBOW = getBagOfWords(question);
  return loadModelPromise
    .then((model) => {
      let imageTensor = tf.browser.fromPixels(imageData, 3);
      imageTensor = imageTensor.expandDims(0);
      imageTensor = imageTensor.div(255).sub(0.5);

      let questionTensor = tf.tensor(questionBOW);
      questionTensor = questionTensor.expandDims(0);

      let output = model.predict([imageTensor, questionTensor]);

      let [answerIndex] = output.argMax(1).arraySync();
      return ANSWERS[answerIndex];
    })
    .catch(console.error);
}
