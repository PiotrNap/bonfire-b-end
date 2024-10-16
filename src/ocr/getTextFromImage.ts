import Tesseract from "tesseract.js"

export default function getTextFromImage(i: any) {
  const image_path = i
  Tesseract.recognize(image_path, "eng", {
    logger: (m) => console.log(m),
  }).then(({ data: { text } }) => {
    return text
  })
}
