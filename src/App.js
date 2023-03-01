import "./App.css";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useState, useEffect, useRef } from "react";
import {
  getCopyOfElementsObj,
  convertStrToJSON,
  beautiflowifyWithAnimation,
  beautiflowifyWithAnimationAllAtOnce,
  shiftAnnosPosFromNodes,
  resetAnnosPosFromNodes,
  getFlowJSON,
  getDateTime,
} from "./Cy";
import CustomToggle from "./CustomToggle";
import CytoscapeComponent from "react-cytoscapejs";

function App() {
  const defaultAnimationDuration = 0.5;
  const maxAnimationDuration = 10;
  const minAnimationDuration = 0.1;
  const cyRef = useRef(null);
  const fileRef = useRef(null);
  const flowJSONRef = useRef(null);
  const cloneElesRef = useRef(null);
  const [elesForCyInit, setElesForCyInit] = useState(null);
  // const [flowJSON, setFlowJSON] = useState("");
  const [ogElesClone, setOGElesClone] = useState(null);
  const [aniText, setAniText] = useState("Ready!");
  const [aniDescriptionText, setAniDescriptionText] = useState("");
  const [annosShifted, setAnnosShifted] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [aniDur, setAniDur] = useState(defaultAnimationDuration);

  const handleFileInputLabelClick = (e) => {
    e.preventDefault();
    document.getElementById("fileInput").click();
  };

  const loadFlowJSONFromFile = async (e) => {
    e.preventDefault();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const fileJSON = convertStrToJSON(text);
      flowJSONRef.current = fileJSON;
      const normEles = CytoscapeComponent.normalizeElements(
        getCopyOfElementsObj(fileJSON)
      );

      setElesForCyInit(normEles);
      setAnnosShifted(false);
    };

    if (e.target.files[0]) {
      fileRef.current = e.target.files[0];
      reader.readAsText(e.target.files[0]);
    }
  };

  const reloadFlowJSONFromFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const fileJSON = convertStrToJSON(text);
      flowJSONRef.current = fileJSON;
      const normEles = CytoscapeComponent.normalizeElements(
        getCopyOfElementsObj(fileJSON)
      );

      setElesForCyInit(normEles);
      setAnnosShifted(false);
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  const formatSpacing = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      beautiflowifyWithAnimationAllAtOnce(
        cyRef.current,
        150,
        330,
        aniDur * 1000
      );
    }
  };

  const watchBeautiflowify = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      beautiflowifyWithAnimation(cyRef.current, 150, 330, aniDur * 1000);
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
      const updatedDVFlowJSONStr = JSON.stringify(updatedDVFlowJSON);
      const blob = new Blob([updatedDVFlowJSONStr], { type: "text/plain" });
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
    }
  };

  const clear = (e) => {
    e.preventDefault();
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
    // intermediate node elemnent to reset state
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

  const toggleAccordion = () => {
    const currAccState = !isAccordionOpen;
    setIsAccordionOpen(currAccState);
  };

  const onAnimationDurationChange = (e) => {
    e.preventDefault();
    setAniDur(e.currentTarget.value);
  };

  useEffect(() => {
    if (!annosShifted && cyRef.current) {
      shiftAnnos(cyRef.current.nodes());
      cloneElesRef.current = createClonedNodes(cyRef.current);
    } else if (!flowJSONRef.current && cyRef.current) {
      cyRef.current.unmount();
      cyRef.current.destroy();
      cyRef.current = null;
      setOGElesClone(null);
      setAnnosShifted(false);
    }
  }, [elesForCyInit]);

  if (cyRef.current) {
    cyRef.current.on("style", (e, ani, aniDes, start, end) => {
      if (ani) {
        if (start) {
          setAniText(ani);
        } else if (end) {
          setAniText(ani + " completed");

          if ("Breadth First Search" === ani) {
            setAniDescriptionText("animations completed");
          }
        }
      }
      if (aniDes) {
        if (start) {
          setAniDescriptionText(aniDes);
        } else if (end) {
          setAniDescriptionText(aniDes + " completed");
        }
      }
    });
  }

  return (
    <Container
      fluid
      className="bg-dark justify-content-center"
      style={{ height: "100vh", overflow: "auto" }}
    >
      {elesForCyInit ? (
        <Row className="h-100">
          <Col xs={12} id="cyContainerCol">
            <CytoscapeComponent
              id="cy"
              elements={elesForCyInit}
              layout={{ name: "preset" }}
              style={{
                width: "97.5vw",
                height: "70vh",
                border: ".1rem solid black",
              }}
              //  cy={(cy) => setCyRef(cy)}
              cy={(cy) => {
                cyRef.current = cy;
              }}
              wheelSensitivity={0.1}
              zoom={4}
              stylesheet={[
                {
                  selector: "node",
                  style: {
                    "background-opacity": 0.75,
                    // "background-blacken": -.1,
                    shape: (ele) => {
                      if (ele.data("nodeType") !== "EVAL") {
                        return "rectangle";
                      }
                    },
                    width: (ele) => {
                      if (ele.data("nodeType") === "CONNECTION") {
                        return "75rem";
                      } else if (ele.data("nodeType") === "ANNOTATION") {
                        return ele.data("properties").width.value;
                      } else {
                        return "50rem";
                      }
                    },
                    height: (ele) => {
                      if (ele.data("nodeType") === "CONNECTION") {
                        return "75rem";
                      } else if (ele.data("nodeType") === "ANNOTATION") {
                        const h = ele.data("properties").height?.value;
                        return h ? 25 : 20;
                      } else {
                        return "50rem";
                      }
                    },
                    "background-color": (ele) => {
                      const props = ele.data("properties");
                      const readBGColor = props ? props.backgroundColor : null;
                      if (readBGColor) {
                        return readBGColor.value.slice(0, 7);
                      } else {
                        if (ele.data("nodeType") === "CONNECTION") {
                          return "#ffffff";
                        } else if (ele.data("nodeType") === "ANNOTATION") {
                          return "#f2f3f4";
                        } else {
                          return "orange";
                        }
                      }
                    },
                    label: (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return ele.data("nodeType").slice(0, 4);
                      } else {
                        return (
                          ele.data("nodeType")?.slice(0, 4) +
                          ":\n" +
                          ele.id() +
                          "\n(" +
                          ele.position("x") +
                          "," +
                          ele.position("y") +
                          ")"
                        );
                      }
                    },
                    "font-size": "25rem",
                    "text-wrap": "wrap",
                    "text-valign": "bottom",
                    "text-transform": "lowercase",
                    color: "cyan",
                  },
                },

                {
                  selector: "edge",
                  style: {
                    width: 8,
                    color: "cyan",
                    opacity: 0.7,
                    "font-size": "30rem",
                    "text-justification": "center",
                    "text-margin-x": "-10rem",
                    "text-margin-y": "25rem",
                    "text-rotation": "autorotate",
                    label: (ele) =>
                      ele.target().position("x") - ele.source().position("x"),
                    "line-color": "#777",
                    "target-arrow-color": "#000",
                    "target-arrow-shape": "triangle-backcurve",
                    "curve-style": "bezier",
                    "source-endpoint": "outside-to-line-or-label",
                    "target-endpoint": "outside-to-line-or-label",
                    "source-distance-from-node": "10rem",
                    "target-distance-from-node": "0rem",
                    "arrow-scale": 2,
                  },
                },
              ]}
            ></CytoscapeComponent>
          </Col>
          <Col xs={12}>
            <Form className="h-100">
              <Row height="20vh">
                <Col xs={8}>
                  <Accordion
                    className="h-100 text-light bs-headings-color-light"
                    defaultActiveKey="0"
                    flush
                    onSelect={(eKey) => toggleAccordion(eKey)}
                  >
                    <Accordion.Item
                      eventKey="0"
                      className="h-100 bs-text-light bs-headings-color-light"
                    >
                      {/* <Accordion.Header className="bg-dark bs-text-light bs-headings-color-light"> */}
                      <Card className="h-100 bg-dark">
                        <Card.Header>
                          <CustomToggle
                            eventKey="0"
                            setAccordionCollapsedState={toggleAccordion}
                          >
                            Description of Animation - Expand/Collapse
                          </CustomToggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                          <Card.Body>
                            <Stack
                              className=""
                              style={{ minHeight: "8vh", height: "100%" }}
                            >
                              <h1 className="display-6 fs-4 text-light text-center">
                                {aniText}
                              </h1>
                              <p className="lead text-light">
                                <small>{aniDescriptionText}</small>
                              </p>
                            </Stack>
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion.Item>
                  </Accordion>
                </Col>
                <Col xs={4}>
                  <Row className="gap-1 justify-content-center">
                    <Col xs={12} className="pb-4">
                      <Form.Floating className="mt-2">
                        <Form.Label
                          className="pb-4 mt-1 text-center"
                          placeholder=".1"
                        >
                          <p className="text-light">
                            Animation Duration: {aniDur}s
                          </p>
                        </Form.Label>
                        <Form.Range
                          onChange={(e) => onAnimationDurationChange(e)}
                          value={aniDur}
                          min={minAnimationDuration}
                          max={maxAnimationDuration}
                          step={0.1}
                        />
                      </Form.Floating>
                    </Col>
                    <Col xs={5} className="">
                      <div className="d-grid gap-5">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => watchBeautiflowify(e)}
                        >
                          Beautiflowify
                        </Button>
                      </div>
                    </Col>
                    <Col xs={5} className="">
                      <div className="d-grid gap-5">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => formatSpacing(e)}
                        >
                          Space Out
                        </Button>
                      </div>
                    </Col>
                    <Col xs={5} className="pb-4 pt-4">
                      <div className="d-grid gap-5">
                        <Button
                          id="clickableLableForFileInput"
                          name="clickableLableForFileInput"
                          className=""
                          variant="light"
                          size="sm"
                          onClick={(e) => handleFileInputLabelClick(e)}
                        >
                          {/* <Form.Label
                            className="text-dark text-center"
                            htmlFor="fileInput"
                          > */}
                          <p className="text-dark text-center pt-3">
                            Choose JSON file
                          </p>
                          {/* </Form.Label> */}
                        </Button>
                        <input
                          type="file"
                          id="fileInput"
                          name="fileInput"
                          accept=".json"
                          onChange={(e) => loadFlowJSONFromFile(e)}
                          style={{ display: "none" }}
                        ></input>
                      </div>
                    </Col>
                    <Col xs={5}>
                      <div className="d-grid gap-5">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => exportToDVJSON(e)}
                        >
                          Export
                        </Button>
                      </div>
                    </Col>
                    <Col xs={3}>
                      <div className="d-grid gap-5">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => clear(e)}
                        >
                          Clear
                        </Button>
                      </div>
                    </Col>
                    <Col xs={3}>
                      <div className="d-grid gap-5">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => reset(e)}
                        >
                          Reset
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <p className="text-light text-center mb-0 mt-3">
                        <small>*work in progress</small>
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      ) : (
        <Form className="h-100 p-5">
          <Row className="justify-content-center align-content-center">
            <Col xs={12} className="pt-5">
              <h1 className="display-1 text-light text-center">
                Import a DV flow JSON export file to get started!
              </h1>
            </Col>
            <Col xs={12} className="pb-5 m-5">
              <div className="d-grid">
                <Button
                  id="clickableLableForFileInput"
                  name="clickableLableForFileInput"
                  className=""
                  variant="light"
                  size="lg"
                  onClick={(e) => handleFileInputLabelClick(e)}
                >
                  <Row>
                    <Col xs={12} className="pb-3">
                      <h3 className="text-dark text-center pt-3">
                        Import a JSON file
                      </h3>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <p>
                        <small>*(imports client-side only)</small>
                      </p>
                    </Col>
                  </Row>
                </Button>
                <input
                  type="file"
                  id="fileInput"
                  name="fileInput"
                  accept=".json"
                  onChange={(e) => loadFlowJSONFromFile(e)}
                  style={{ display: "none" }}
                ></input>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <p className="text-light text-center">
                <small>
                  Okay, so beauty is in the eye of the beholder. It spaces nodes
                  out nicely (skipping annotations) and only works for simple
                  flows... for now.
                </small>
              </p>
            </Col>
            <Col xs={12}>
              <p className="text-light text-center">
                <small>*work in progress</small>
              </p>
            </Col>
          </Row>
        </Form>
      )}
    </Container>
  );
}

export default App;
