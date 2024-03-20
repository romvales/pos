import { createRef, useContext, useEffect } from 'react'

import { MultiFormatReader, BarcodeFormat, HybridBinarizer, DecodeHintType, RGBLuminanceSource, BinaryBitmap, BrowserMultiFormatReader } from '@zxing/library'
import { RootContext } from '../App'

export { MediaDevice }

function MediaDevice(props) {
  const rootContext = useContext(RootContext)
  const hints = new Map()
  const reader = new BrowserMultiFormatReader(hints, 500)

  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.UPC_EAN_EXTENSION,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
  ])

  useEffect(() => {
    const videoRef = document.querySelector('#videoRef')
    const videoInput = JSON.parse(localStorage.getItem('VIDEO_INPUT'))

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: 1024,
        height: 1024,
        deviceId: videoInput?.deviceId,
      }
    })
      .then(stream => {
        videoRef.srcObject = stream
        videoRef.play()
        reader.decodeFromStream(stream, null, (e) => {
          if (e) {
            rootContext.setCurrentBarcodeText(e.getText())
          }
        })
      })
  }, [])

  return (
    <>
      <video id='videoRef' disablePictureInPicture={true} className='fixed-bottom d-none' style={{ width: 256, height: 256 }} onSeeked={() => console.log(123)}></video>
    </>
  )
}