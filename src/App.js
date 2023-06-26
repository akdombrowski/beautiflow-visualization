import { useState, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import CytoscapeComponent from "react-cytoscapejs";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import {
  getCopyOfElementsObj,
  convertStrToJSON,
  shiftAnnosPosFromNodes,
  resetAnnosPosFromNodes,
  getFlowJSON,
  getDateTime,
} from "./cy.js";
import ErrorScreen from "./ErrorScreen.jsx";
import ErrorFallback from "./ErrorFallback.jsx";
import WarningModal from "./WarningModal.jsx";
import FlowFormattingUX from "./FlowFormattingUX.js";

function App() {
  const cyRef = useRef(null);
  const fileRef = useRef(null);
  const flowsRef = useRef(null);
  const flowJSONRef = useRef(null);
  const cloneElesRef = useRef(null);
  const [elesForCyInit, setElesForCyInit] = useState(null);
  const [ogElesClone, setOGElesClone] = useState(null);
  const [annosShifted, setAnnosShifted] = useState(false);
  const [doesFlowCauseError, setDoesFlowCauseError] = useState(false);
  const [importFlowError, setFlowErrorMessage] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = (e) => {
    e.preventDefault();
    clear(e);
    setShow(false);
  };

  const handleContinueAnyways = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const handleShow = (e) => {
    e.preventDefault();
    setShow(true);
  };

  const initializeElements = (flowJSON) => {
    const normEles = CytoscapeComponent.normalizeElements(
      getCopyOfElementsObj(flowJSON)
    );

    setElesForCyInit(normEles);
    setAnnosShifted(false);
  };

  const readFileForFlowJSON = () => {
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      const text = e.target.result;
      const fileJSON = convertStrToJSON(text);
      let flowJSON = fileJSON;

      // The file has multiple flows
      if (fileJSON.flows) {
        // pop open warning modal
        handleShow(e);

        // in case we don't find which one is the parent flow, default to the
        // first flow in the array.
        flowsRef.current = fileJSON.flows[0];
        flowJSON = fileJSON.flows[0];

        // iterate over the array of flows and find the parent flow
        for (const flow of fileJSON.flows) {
          if (flow.parentFlowId && flow.flowId === flow.parentFlowId) {
            flowsRef.current = flow;
            flowJSON = flow;
          }
        }
      }

      flowJSONRef.current = flowJSON;

      initializeElements(flowJSON);
    });

    return reader;
  };

  const loadFlowJSONFromFile = async (e) => {
    e.preventDefault();

    const reader = readFileForFlowJSON();

    if (e.target.files[0]) {
      fileRef.current = e.target.files[0];
      reader.readAsText(e.target.files[0]);
    }
  };

  const reloadFlowJSONFromFile = (file) => {
    const reader = readFileForFlowJSON();

    if (file) {
      reader.readAsText(file);
    }
  };

  const createClonedNodes = (cy) => {
    if (cy && cy.$("*") && !ogElesClone) {
      const clonedEles = cyRef.current.$("*").clone();
      return clonedEles;
    }
  };

  const shiftAnnos = (nodes) => {
    if (!annosShifted) {
      shiftAnnosPosFromNodes(nodes);
      setAnnosShifted(true);
    }
  };

  const exportToDVJSON = (e) => {
    e.preventDefault();
    if (cyRef.current && flowJSONRef.current) {
      cyRef.current.stop(true);
      resetAnnosPosFromNodes(cyRef.current.nodes());

      const updatedDVFlowJSON = getFlowJSON(flowJSONRef.current, cyRef.current);
      const updatedDVFlowJSONString = JSON.stringify(updatedDVFlowJSON);
      const blob = new Blob([updatedDVFlowJSONString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateTime = getDateTime();
      if (fileRef.current?.name) {
        link.download =
          "beautiflowified---" + dateTime + "---" + fileRef.current.name;
      } else {
        link.download = "dvBeautiflow---" + dateTime;
      }

      link.href = url;
      link.click();

      shiftAnnosPosFromNodes(cyRef.current.nodes());
    }
  };

  const clearErr = (e) => {
    e.preventDefault();

    console.log("Copy both the message and cause below if reporting...");
    console.log(JSON.stringify(importFlowError));
    console.log("Error message:");
    console.log(importFlowError);
    console.log("Error cause:");
    console.log(importFlowError.cause);

    setDoesFlowCauseError(false);
    setFlowErrorMessage("");
  };

  const clear = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (cyRef.current) {
      cyRef.current.stop(true);
      cyRef.current.unmount();
      cyRef.current.destroy();
      cyRef.current = null;
    }

    fileRef.current = null;
    setElesForCyInit(null);
    setAnnosShifted(false);
  };

  const reset = (e) => {
    e.preventDefault();
    const file = fileRef.current;
    // Intermediate node element to reset state
    setElesForCyInit([
      {
        data: {
          id: "reloading",
          nodeType: "RELOADING",
          name: "Reloading",
          properties: {
            backgroundColor: { value: "#ffffffff" },
            annotation: { value: "Reloading" },
            annotationTextColor: { value: "#000000ff" },
            strokeEnabled: { value: false },
            strokeWidth: { value: 0 },
            strokeColor: { value: "#000000ff" },
            cornerRadius: { value: 5 },
            fontSize: { value: 0 },
            fontFamily: { value: "sans-serif" },
            height: { value: 50 },
            width: { value: 180 },
          },
          status: "configured",
          idUnique: "reloading",
        },
        position: { x: 0, y: 0 },
        group: "nodes",
        removed: false,
        selected: false,
        selectable: false,
        locked: true,
        grabbable: false,
        pannable: false,
        classes: "",
      },
    ]);

    reloadFlowJSONFromFile(file);
  };

  useEffect(() => {
    if (!annosShifted && !show && cyRef.current) {
      shiftAnnos(cyRef.current.nodes());
      cloneElesRef.current = createClonedNodes(cyRef.current);
    } else if (!flowJSONRef.current && cyRef.current) {
      cyRef.current.unmount();
      cyRef.current.destroy();
      cyRef.current = null;
      setOGElesClone(null);
      setAnnosShifted(false);
    }
  }, [elesForCyInit, show]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        clear();
      }}
      resetKeys={[elesForCyInit, annosShifted]}
    >
      <Container
        fluid
        className="bg-dark justify-content-center"
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden auto",
        }}
      >
        {elesForCyInit && !show ? (
          <FlowFormattingUX
            elesForCyInit={elesForCyInit}
            loadFlowJSONFromFile={loadFlowJSONFromFile}
            exportToDVJSON={exportToDVJSON}
            clear={clear}
            reset={reset}
            ref={cyRef}
          />
        ) : (
          <Row className="p-0 m-0 h-100 align-content-start gap-3">
            <Col xs={12} className="pb-5">
              <Row className="pb-5">
                <Col
                  id="beautiflowifyTitle"
                  xs={10}
                  sm={9}
                  md={8}
                  lg={7}
                  xl={6}
                >
                  <h1 className="display-1 text-light fw-bolder">
                    Beautiflow<i>-ify</i>
                  </h1>
                </Col>

                <Col xs={2} sm={3} md={4} lg={5} xl={6} className="pt-4">
                  <h6 className="col-12 display-9 text-info text-center">
                    Import a JSON export of a DV flow to make it
                  </h6>
                  <h5 className="col-12 display-7 text-info text-center">
                    <b>
                      <i>beautiflow</i>
                    </b>
                    !
                  </h5>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Row
                    id="fileImportContainer"
                    className="justify-content-center"
                  >
                    <Col xs={10}>
                      <Form>
                        <Form.Group controlId="formFileLg">
                          <Form.Control
                            type="file"
                            size="lg"
                            style={{ backgroundColor: "var(--bs-dark)" }}
                            onChange={(e) => loadFlowJSONFromFile(e)}
                          />
                        </Form.Group>
                      </Form>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xs={12} className="pb-5">
              <Row
                id="textExplainationRow"
                className="justify-content-center flex-fill"
              >
                <Col xs={12}>
                  <Row className="pb-1">
                    <Col xs={12}>
                      <p className="fs-6 p-0 text-light text-center font-monospace fw-lighter text-break">
                        This tool will 🤞 <i>attempt</i> to space DaVinci Flow
                        nodes out beautifully <i>(ignoring annotations)</i>
                        <br />
                        Tries to preserve the relative ordering of nodes, a.k.a.
                        the "flow".
                        <br /> Then, you can export from here and import into DV
                        and have a beautifully spaced flow.
                      </p>
                    </Col>
                  </Row>
                  <Row className="justify-content-center">
                    <Col xs={10}>
                      <p className="fs-5 p-0 text-warning text-start font-monospace fw-bolder text-break">
                        Tips
                      </p>
                    </Col>
                  </Row>
                  <Row className="justify-content-center">
                    <Col xs={10}>
                      <ul>
                        <li>
                          <p className="fs-6 p-0 text-warning text-start font-monospace fw-lighter text-break">
                            Export flows individually (without subflows) if
                            using this tool. It won't blow up or anything, but
                            you'll be sad.
                          </p>
                        </li>
                        <li>
                          <p className="fs-6 p-0 text-warning text-start font-monospace fw-lighter text-break">
                            Run this before adding annotations since this leaves
                            annotations in their original positions. Or not. Do
                            what you gotta do.
                          </p>
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col id="buttonDefnsTable" xs={12}>
              <Table borderless hover responsive variant="dark" size="sm">
                <tbody>
                  <tr>
                    <td className="col-lg-3 col-md-4 col-sm-4 col-5">
                      <h3 className="font-monospace fw-bold m-0 text-info text-end text-break text-wrap">
                        Beautiflowify
                      </h3>
                    </td>

                    <td className="col-lg-9 col-md-8 col-sm-8 col-7 align-middle">
                      <p className="fs-5 m-0 text-info text-start font-monospace  text-wrap">
                        Space out nodes <i>beautifully</i>.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td className="col-lg-3 col-md-4 col-6">
                      <p className="fs-5 m-0 text-info text-end font-monospace  text-wrap">
                        Export
                      </p>
                    </td>
                    <td className="col-lg-9 col-md-8 col-6 align-middle">
                      <p className="fs-6 m-0 text-info text-start font-monospace text-wrap">
                        Exports an updated JSON file that you can upload to{" "}
                        <a
                          href="http://pingidentity.com/signon"
                          target="_blank"
                          style={{ color: "var(--bs-light)" }}
                        >
                          DaVinci
                        </a>
                        .
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td className="col-lg-3 col-md-4 col-6">
                      <p className="fs-5 m-0 text-info text-end font-monospace  text-wrap">
                        Clear
                      </p>
                    </td>
                    <td className="col-lg-9 col-md-8 col-6 align-middle">
                      <p className="fs-6 m-0 text-info text-start font-monospace  text-wrap">
                        Wipes out the nodes and brings you back to this screen.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td className="col-lg-3 col-md-4 col-6">
                      <p className="fs-5 m-0 text-info text-end font-monospace  text-wrap">
                        Reset
                      </p>
                    </td>
                    <td className="col-lg-9 col-md-8 col-6 align-middle">
                      <p className="fs-6 m-0 text-info text-start font-monospace  text-wrap">
                        Return nodes to their original positions.
                        <br />
                        Warning: animations might continue to run in the
                        background.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col xs={12}>
              <div className="fixed-bottom">
                <p className="text-secondary text-end pe-3">
                  <small>*work in progress</small>
                </p>
              </div>
            </Col>
            <WarningModal
              show={show}
              handleClose={handleClose}
              handleContinueAnyways={handleContinueAnyways}
            />
          </Row>
        )}
      </Container>
    </ErrorBoundary>
  );
}

export default App;
