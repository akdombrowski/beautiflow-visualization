import logo from "./logo.svg";
import "./App.css";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { useState, useEffect, useRef } from "react";
import {
  createCytoscapeGraphForViz,
  readFlowJSONFileWithFileReader,
  getCopyOfElementsObj,
  convertStrToJSON,
  beautiflowifyWithAnimation,
  shiftAnnosPosFromNodes,
  beautiflowifyWithAnimationAllAtOnce,
} from "./Cy";
import CytoscapeComponent from "react-cytoscapejs";
import CustomToggle from "./CustomToggle";

function App() {
  const [file, setFile] = useState("");
  const [flowJSON, setFlowJSON] = useState("");
  const [ogNodesClone, setOGNodesClone] = useState(null);
  const [elements, setElements] = useState("");
  const [aniText, setAniText] = useState("Ready!");
  const [aniDescriptionText, setAniDescriptionText] = useState("");
  const [anniesShifted, setAnnosShifted] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  // const [cyHeight, setCyHeight] = useState(cyHeightAccOpen);
  const defaultAnimationDuration = 0.5;
  const maxAnimationDuration = 10;
  const [aniDur, setAniDur] = useState(defaultAnimationDuration);
  const cyRef = useRef(null);

  const cyContainerID = "cyContainer";
  const filename =
    "/home/adombrowski/workspace/beautiflowify/testFlows/WO_subflow_condensed_columns and rows - Beautiflow - Demo 3 - PingOne Sign-On, Password Forgot and Reset, User Registration_Export_2023-02-19T14_27_48.361Z.json";

  const loadFlowJSONFromFile = async (e) => {
    e.preventDefault();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const flowJSON = convertStrToJSON(text);
      setElements(getCopyOfElementsObj(flowJSON));
      setAnnosShifted(false);
    };

    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      reader.readAsText(e.target.files[0]);
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
    if (cy && cy.$("*") && !ogNodesClone) {
      const clones = cyRef.current.$("*").clone();
      setOGNodesClone(clones);
      return clones;
    }
  };

  const shiftAnnos = (nodes) => {
    if (!anniesShifted) {
      shiftAnnosPosFromNodes(nodes);
      setAnnosShifted(true);
    }
  };

  const clear = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      cyRef.current.stop(true);
    }
    document.getElementById("fileInput").value = "";
    setFile("");
    setElements("");
    setAnnosShifted(false);
    setOGNodesClone(null);
  };

  const reset = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      const cy = cyRef.current;
      cy.stop(true, true);
      cy.$("*").forEach((ele, i, eles) => {
        ele.stop(true, true);
      });
      cy.remove("*");
      cy.add(ogNodesClone);
    }
  };

  const toggleAccordion = (evKey) => {
    const currAccState = !isAccordionOpen;
    setIsAccordionOpen(currAccState);
  };

  const onAnimationDurationChange = (e) => {
    e.preventDefault();
    setAniDur(e.currentTarget.value);
  };

  useEffect(() => {
    if (!anniesShifted && cyRef.current) {
      shiftAnnos(cyRef.current.nodes());
    }
  });

  useEffect(() => {
    if (elements && cyRef.current) {
      createClonedNodes(cyRef.current);
    } else if (!elements && cyRef.current) {
      setOGNodesClone(null);
      cyRef.current.unmount();
      cyRef.current.destroy();
    }
  }, [elements]);

  if (cyRef.current) {
    const cy = cyRef.current;
    cy.on("style", (e, ani, aniDes, start, end) => {
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
      {elements ? (
        <Row className="h-100">
          <Col xs={12} id="cyContainerCol">
            <CytoscapeComponent
              id="cy"
              elements={CytoscapeComponent.normalizeElements(elements)}
              layout={{ name: "preset" }}
              style={{
                width: "97.5vw",
                height: "70vh",
                border: ".1rem solid black",
              }}
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
                    onSelect={(eKey, e) => toggleAccordion(eKey)}
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
                        {/* controlId="floatingInput"
                    label={"Animation Duration:" + aniDur}
                    className="text-light pb-2 mt-2"
                  > */}
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
                          min={0.1}
                          max={10}
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
                    <Col xs={12} className="pb-4 pt-4">
                      <div className="d-grid gap-5">
                        <Button
                          id="fileInput"
                          variant="light"
                          as="input"
                          type="file"
                          accept=".json"
                          size="lg"
                          onChange={(e) => loadFlowJSONFromFile(e)}
                        ></Button>
                      </div>
                    </Col>
                  </Row>
                  <Row className="justify-content-center">
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
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      ) : (
        <Form className="h-100 p-5">
          <Row className="h-100 justify-content-center align-content-center">
            <Col xs={12} className="pb-5">
              <h1 className="display-1 text-light text-center">
                Choose a DV flow JSON export file to get started!
              </h1>
            </Col>
            <Col xs={12} className="p-5 m-5">
              <div className="d-grid gap-5">
                <Button
                  id="fileInput"
                  variant="light"
                  as="input"
                  type="file"
                  accept=".json,text/*"
                  size="lg"
                  onChange={(e) => loadFlowJSONFromFile(e)}
                ></Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </Container>
  );
}

export default App;
