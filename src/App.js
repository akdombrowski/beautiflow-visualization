import logo from "./logo.svg";
import "./App.css";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import { useState, useEffect, useRef } from "react";
import {
  createCytoscapeGraphForViz,
  readFlowJSONFileWithFileReader,
  getCopyOfElementsObj,
  convertStrToJSON,
  bfsAnimation,
  shiftAnnosPosFromNodes,
} from "./Cy";
import CytoscapeComponent from "react-cytoscapejs";
import CustomToggle from "./AccordionToggle";

function App() {
  const [file, setFile] = useState("");
  const [flowJSON, setFlowJSON] = useState("");
  const [ogNodesClone, setOGNodesClone] = useState("");
  const [elements, setElements] = useState("");
  const [aniText, setAniText] = useState("Ready!");
  const [aniDescriptionText, setAniDescriptionText] = useState("");
  const [anniesShifted, setAnnosShifted] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [cyHeight, setCyHeight] = useState("70vh");
  const cyRef = useRef(null);
  const cyContainerID = "cyContainer";
  const filename =
    "/home/adombrowski/workspace/beautiflowify/testFlows/WO_subflow_condensed_columns and rows - Beautiflow - Demo 3 - PingOne Sign-On, Password Forgot and Reset, User Registration_Export_2023-02-19T14_27_48.361Z.json";
  const cyHeightAccOpen = "70vh";
  const cyHeightAccClosed = "80vh";

  const loadFlowJSONFromFile = async (e) => {
    e.preventDefault();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const flowJSON = convertStrToJSON(text);
      setElements(getCopyOfElementsObj(flowJSON));
      setAnnosShifted(false);
    };

    setFile(e.target.files[0]);
    reader.readAsText(e.target.files[0]);
  };

  const formatSpacing = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      bfsAnimation(cyRef.current, 150, 330);
    }
  };

  const bfs = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      bfsAnimation(cyRef.current, 150, 330);
    }
  };

  const createClonedNodes = (cy) => {
    if (cy && cy.$("*")) {
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
  };

  const reset = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      const cy = cyRef.current;
      console.log(cy.animated());
      cy.stop(true, true);
      cy.$("*").forEach((ele, i, eles) => {
        ele.stop(true, true);
      });
      console.log(cy.animated());
      cy.remove("*");
      cy.add(ogNodesClone);
    }
  };

  const toggleAccordion = (evKey) => {
    const currAccState = !isAccordionOpen;
    setIsAccordionOpen(currAccState);
  };

  if (cyRef.current) {
    const cy = cyRef.current;
    cy.on("style", (e, ani, aniDes, start, end) => {
      if (ani) {
        if (start) {
          setAniText(ani);
        } else if (end) {
          setAniText(ani + " completed");
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
  useEffect(() => {
    if (!anniesShifted && cyRef.current) {
      shiftAnnos(cyRef.current.nodes());
    }
  });
  useEffect(() => {
    if (cyRef.current) {
      const clones = createClonedNodes(cyRef.current);
    }
  }, [cyRef.current]);

  useEffect(() => {
    if (isAccordionOpen) {
      setCyHeight(cyHeightAccOpen);
    } else {
      setCyHeight(cyHeightAccClosed);
    }
  }, [isAccordionOpen]);

  return (
    <div className="bg-dark" style={{ minHeight: "100vh" }}>
      <Container fluid className="bg-dark">
        <Row>
          <Col xs={12} id="cyContainerCol" style={{ height: cyHeight }}>
            {elements ? (
              <CytoscapeComponent
                id="cy"
                elements={CytoscapeComponent.normalizeElements(elements)}
                layout={{ name: "preset" }}
                style={{ width: "100vw", height: "100%" }}
                stylesheet={[
                  {
                    selector: "node",
                    style: {
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
                        if (ele.data("nodeType") === "CONNECTION") {
                          return "#000";
                        } else if (ele.data("nodeType") === "ANNOTATION") {
                          return ele.data("properties").backgroundColor.value;
                          // return "#4462edff";
                        } else {
                          return "orange";
                        }
                      },
                      label: (ele) => ele.data("nodeType")?.slice(0, 4),
                      "font-size": "40rem",
                      color: "cyan",
                    },
                  },

                  {
                    selector: "edge",
                    style: {
                      width: 10,
                      "line-color": "#fff",
                      "target-arrow-color": "purple",
                      "target-arrow-shape": "triangle-backcurve",
                      "curve-style": "bezier",
                      "source-distance-from-node": "20rem",
                      "target-distance-from-node": "0rem",
                      "arrow-scale": 3,
                    },
                  },
                ]}
                cy={(cy) => {
                  cyRef.current = cy;
                }}
                wheelSensitivity={0.1}
                zoom={4}
              ></CytoscapeComponent>
            ) : (
              ""
            )}
          </Col>
        </Row>
        <Row height="10vh">
          <Accordion
            className=" text-light bs-headings-color-light"
            defaultActiveKey="0"
            flush
            onSelect={(eKey, e) => toggleAccordion(eKey)}
          >
            <Accordion.Item
              eventKey="0"
              className=" bs-text-light bs-headings-color-light"
            >
              {/* <Accordion.Header className="bg-dark bs-text-light bs-headings-color-light"> */}
              <Card className="bg-dark">
                <Card.Header>
                  <CustomToggle
                    eventKey="0"
                    setAccordionCollapsedState={toggleAccordion}
                  >
                    Expand
                  </CustomToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    <Stack gap={1} className="" style={{ minHeight: "8vh" }}>
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
              {/* </Accordion.Header> */}
              {/* <Accordion.Body className="">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Accordion.Body> */}
            </Accordion.Item>
          </Accordion>
        </Row>
        <Row className="bg-dark pb-3" height="5vh">
          <Col xs={3}>
            <div className="d-grid gap-5">
              <Button variant="outline-light" size="lg" onClick={(e) => bfs(e)}>
                BFS
              </Button>
            </div>
          </Col>
          <Col xs={6}>
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
          <Col xs={3}>
            <div className="d-grid gap-5">
              <Button
                variant="outline-light"
                size="lg"
                onClick={(e) => formatSpacing(e)}
              >
                Space Out
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            <div className="d-grid gap-5">
              <Button
                variant="outline-light"
                size="lg"
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
                size="lg"
                onClick={(e) => reset(e)}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
