import React, { Component } from "react"
import { FacePhiSelphi, FPhiSelphiConstants } from "facephi-selphi-react"

export default class App extends Component {

  static FPhiCameraResolutions = {
    res480p: { title: "640x480", width: 640, height: 480 },
    res600p: { title: "800x600", width: 800, height: 600 },
    res768p: { title: "1024x768", width: 1024, height: 768 },
    res720p: { title: "1280x720 (720p)", width: 1280, height: 720 },
    res1080p: { title: "1920x1080 (1080p)", width: 1920, height: 1080 },
  }

  constructor(props) {
    super(props)

    this.state = {
      isWidgetCaptureStarted: false,

      widgetExtractionMode: FPhiSelphiConstants.ExtractionMode.Authenticate,
      widgetLivenessMode: FPhiSelphiConstants.LivenessMode.Blink,
      widgetInteractible: true,
      widgetTutorial: false,
      widgetStabilizationStage: false,
      widgetDebugMode: false,
      widgetCameraResolution: "res720p",

      widgetCameraWidth: App.FPhiCameraResolutions.res720p.width,
      widgetCameraHeight: App.FPhiCameraResolutions.res720p.height
    }

    // Class event binding...
    this.handleInputChange = this.handleInputChange.bind(this)

    this.onStartCapture = this.onStartCapture.bind(this)
    this.onStopCapture = this.onStopCapture.bind(this)

    this.onModuleLoaded = this.onModuleLoaded.bind(this)
    this.onStabilizing = this.onStabilizing.bind(this)
    this.onExtractionFinish = this.onExtractionFinish.bind(this)
    this.onUserCancel = this.onUserCancel.bind(this)
    this.onExceptionCaptured = this.onExceptionCaptured.bind(this)
    this.onLivenessError = this.onLivenessError.bind(this)
    this.onLivenessErrorButtonClick = this.onLivenessErrorButtonClick.bind(this)
    this.onExtractionTimeout = this.onExtractionTimeout.bind(this)
    this.onTimeoutErrorButtonClick = this.onTimeoutErrorButtonClick.bind(this)
  }

  render() {
    return (
      <div className="row col-centered" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="col-12 col-md-9" style={{ minHeight: 550, display: 'flex', justifyContent: 'center' }}>
          {this.state.isWidgetCaptureStarted ?
            <FacePhiSelphi widgetLibPath={`${process.env.PUBLIC_URL}assets/selphi`}
              className="h-100"

              language="es"
              extractionMode={this.state.widgetExtractionMode}
              livenessMode={this.state.widgetLivenessMode}

              cameraWidth={this.state.widgetCameraWidth}
              cameraHeight={this.state.widgetCameraHeight}

              interactible={this.state.widgetInteractible}
              tutorial={this.state.widgetTutorial}
              stabilizationStage={this.state.widgetStabilizationStage}
              
              logImages={true}
              cropFactor={1.7}
              debugMode={this.state.widgetDebugMode}

              onModuleLoaded={this.onModuleLoaded}
              onStabilizing={this.onStabilizing}
              onExtractionFinish={this.onExtractionFinish}
              onUserCancel={this.onUserCancel}
              onExceptionCaptured={this.onExceptionCaptured}
              onLivenessError={this.onLivenessError}
              onLivenessErrorButtonClick={this.onLivenessErrorButtonClick}
              onExtractionTimeout={this.onExtractionTimeout}
              onTimeoutErrorButtonClick={this.onTimeoutErrorButtonClick}>
            </FacePhiSelphi>
          : <button style={{ width: '250px', height: '35px', fontSize: '1.6rem' }} type="button" id="btnStartCapture" className="btn btn-primary btn-block" onClick={this.onStartCapture} disabled={this.state.isWidgetCaptureStarted}>Comenzar captura</button>}
        </div>
      </div>
    )
  }

  handleInputChange(event) {
    if (event.target.id === "widgetCameraResolution") {
      this.setState({
        widgetCameraWidth: App.FPhiCameraResolutions[event.target.value].width,
        widgetCameraHeight: App.FPhiCameraResolutions[event.target.value].height
      })
    }

    this.setState({
      [event.target.id]: event.target.type === "checkbox" ? event.target.checked : event.target.value
    })

    console.warn(">>>> [app] handleInputChange", this.state)
  }

  onStartCapture() { 
    console.warn(">>>> [app] onStartCapture", this.state)
    this.setState({ isWidgetCaptureStarted: true }) 
  }

  onStopCapture() {
    console.warn(">>>> [app] onStopCapture", this.state)
    this.setState({ isWidgetCaptureStarted: false }) 
  }

  // Widget event handlers
  onModuleLoaded() {
    console.warn("[Selphi] onModuleLoaded")
  }

  onStabilizing(stabilizingResult) {
    console.warn("[Selphi] onStabilizing")
    console.log(stabilizingResult)
  }

  onExtractionFinish(extractionResult) {
    console.warn("[Selphi] onExtractionFinish")
    console.log(extractionResult)

    console.log("Images returned: ", extractionResult.detail.images)
    for (let i = 0; i < extractionResult.detail.images.length; i++) {
      const img = extractionResult.detail.images[i]
      console.log(`Image ${i}: ${img.src}`)
    }

    if (extractionResult.detail.bestImage)
      console.log("BestImage: ", extractionResult.detail.bestImage.src)
    if (extractionResult.detail.bestImageCropped)
      console.log("BestImageCropped: ", extractionResult.detail.bestImageCropped.src)

    console.log("Template: ", extractionResult.detail.template)
    console.log("TemplateRaw: ", extractionResult.detail.templateRaw)
    console.log("TimeStamp: ", extractionResult.detail.timeStamp)

    console.log("LivenessMoveFails: ", extractionResult.detail.livenessMoveFails)
    console.log("SunGlassesScore: ", extractionResult.detail.sunGlassesScore)

    console.log("LivenessMoveHistory: ", extractionResult.detail.livenessMoveHistory)
    console.log("LivenessMoveStabilizedStatusHistory: ", extractionResult.detail.livenessMoveStabilizedStatusHistory)
    console.log("LivenessMoveLastStabilizedStatus: ", extractionResult.detail.livenessMoveLastStabilizedStatus)

    this.setState({ isWidgetCaptureStarted: false })
  }

  onUserCancel() {
    console.warn("[Selphi] onUserCancel")
    this.setState({ isWidgetCaptureStarted: false })
  }

  onExceptionCaptured(exceptionResult) {
    console.warn("[Selphi] onExceptionCaptured")
    console.log(`exceptionType: ${exceptionResult.detail.exceptionType}`)
    console.log(`exceptionMessage: ${exceptionResult.detail.message}`)
    console.log(exceptionResult)

    this.setState({ isWidgetCaptureStarted: false })
  }

  onLivenessError(livenessErrorResult) {
    console.warn("[Selphi] onLivenessError")
    console.log(livenessErrorResult)

    switch (livenessErrorResult.detail.livenessErrorType) {
      case FPhiSelphiConstants.LivenessDiagnostic.Unsuccess:
        console.log("[Selphi] Liveness error: Blink or movement not detected")
        break
      case FPhiSelphiConstants.LivenessDiagnostic.UnsuccessLowPerformance:
        console.log("[Selphi] Liveness error: Low performance")
        break
      case FPhiSelphiConstants.LivenessDiagnostic.UnsuccessGlasses:
        console.log("[Selphi] Liveness error: Glasses detected")
        break
      case FPhiSelphiConstants.LivenessDiagnostic.UnsuccessLight:
        console.log("[Selphi] Liveness error: Bad lighting conditions")
        break
      case FPhiSelphiConstants.LivenessDiagnostic.UnsuccessNoMovement:
        console.log("[Selphi] Liveness error: No movement")
        break
      case FPhiSelphiConstants.LivenessDiagnostic.UnsuccessWrongDirection:
        console.log("[Selphi] Liveness error: Wrong direction")
        break
      case FPhiSelphiConstants.LivenessDiagnostic.UnsuccessTooFar:
        console.log("[Selphi] Liveness error: Face too far")
        break
      default:
        console.log("[Selphi] Liveness error")
        break
    }
  }

  onLivenessErrorButtonClick() {
    console.warn("[Selphi] onLivenessErrorButtonClick")
    this.setState({ isWidgetCaptureStarted: false })
  }

  onExtractionTimeout(extractionTimeoutResult) {
    console.warn("[Selphi] onExtractionTimeout")
    console.log(extractionTimeoutResult)
  }

  onTimeoutErrorButtonClick() {
    console.warn("[Selphi] onTimeoutErrorButtonClick")
    this.setState({ isWidgetCaptureStarted: false })
  }
}