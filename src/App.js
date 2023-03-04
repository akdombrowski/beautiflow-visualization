import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useState, useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import {
  getCopyOfElementsObj,
  convertStrToJSON,
  beautiflowify,
  shiftAnnosPosFromNodes,
  resetAnnosPosFromNodes,
  getFlowJSON,
  getDateTime,
} from "./cy.js";
import CustomToggle from "./CustomToggle.jsx";
import HomeFileImportForm from "./HomeFileImportForm.jsx";

function App() {
  const defaultAnimationDuration = 0.5;
  const maxAnimationDuration = 5;
  const minAnimationDuration = 0.01;
  const cyRef = useRef(null);
  const fileRef = useRef(null);
  const flowJSONRef = useRef(null);
  const cloneElesRef = useRef(null);
  const [elesForCyInit, setElesForCyInit] = useState(null);
  const [ogElesClone, setOGElesClone] = useState(null);
  const [aniText, setAniText] = useState("Ready!");
  const [aniDescriptionText, setAniDescriptionText] = useState("");
  const [annosShifted, setAnnosShifted] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [aniDur, setAniDur] = useState(defaultAnimationDuration);

  const handleFileInputLabelClick = (e) => {
    e.preventDefault();
    document.querySelector("#fileInput").click();
  };

  const loadFlowJSONFromFile = async (e) => {
    e.preventDefault();

    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      const text = e.target.result;
      const fileJSON = convertStrToJSON(text);
      flowJSONRef.current = fileJSON;
      const normEles = CytoscapeComponent.normalizeElements(
        getCopyOfElementsObj(fileJSON)
      );

      setElesForCyInit(normEles);
      setAnnosShifted(false);
    });

    if (e.target.files[0]) {
      fileRef.current = e.target.files[0];
      reader.readAsText(e.target.files[0]);
    }
  };

  const reloadFlowJSONFromFile = async (file) => {
    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      const text = e.target.result;
      const fileJSON = convertStrToJSON(text);
      flowJSONRef.current = fileJSON;
      const normEles = CytoscapeComponent.normalizeElements(
        getCopyOfElementsObj(fileJSON)
      );

      setElesForCyInit(normEles);
      setAnnosShifted(false);
    });

    if (file) {
      reader.readAsText(file);
    }
  };

  const formatSpacing = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      beautiflowify(cyRef.current, 150, 0, aniDur * 1000, false);
    }
  };

  const watchBeautiflowify = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      beautiflowify(cyRef.current, 150, 330, aniDur * 1000, true);
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
    // Intermediate node elemnent to reset state
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
    setAniDur(
      new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
        e.currentTarget.value
      )
    );
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

          if (ani === "Breadth First Search") {
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
      style={{ height: "100vh", maxWidth: "100vw", overflow: "hidden auto" }}
    >
      {elesForCyInit ? (
        <Row className="h-100 p-0  m-0 ">
          <Col className="h-100 p-1 m-0" xs={9} lg={10} id="cyContainerCol">
            <CytoscapeComponent
              id="cy"
              elements={elesForCyInit}
              layout={{ name: "preset" }}
              style={{
                width: "100%",
                height: "100%",
              }}
              cy={(cy) => {
                cyRef.current = cy;
              }}
              wheelSensitivity={0.1}
              zoom={4}
              boxSelectionEnabled={false}
              autoungrabify={true}
              autounselectify={true}
              stylesheet={[
                {
                  selector: "node",
                  style: {
                    shape: (ele) => {
                      if (ele.data("nodeType") !== "EVAL") {
                        return "rectangle";
                      }

                      return "round-diamond";
                    },
                    width: (ele) => {
                      if (ele.data("nodeType") === "CONNECTION") {
                        return "75";
                      }

                      if (ele.data("nodeType") === "ANNOTATION") {
                        return ele.data("properties").width.value;
                      }

                      return "50";
                    },
                    height: (ele) => {
                      if (ele.data("nodeType") === "CONNECTION") {
                        return "75";
                      }

                      if (ele.data("nodeType") === "ANNOTATION") {
                        const h = ele.data("properties").height?.value;
                        return h ? 25 : 20;
                      }

                      return "50";
                    },
                    "background-opacity": (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return 0.4;
                      }

                      return 1;
                    },
                    "background-color": (ele) => {
                      const props = ele.data("properties");
                      const readBGColor = props ? props.backgroundColor : null;
                      if (readBGColor) {
                        return readBGColor.value.slice(0, 7);
                      }

                      if (ele.data("nodeType") === "CONNECTION") {
                        return "#CCFBFE";
                      }

                      if (ele.data("nodeType") === "ANNOTATION") {
                        return "#f2f3f4";
                      }

                      return "#ee6c4d";
                    },
                    "background-blacken": (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return 0.5;
                      }

                      return 0;
                    },
                    label: (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return ele.data("nodeType").slice(0, 4);
                      }

                      return (
                        ele.data("nodeType")?.slice(0, 4) +
                        ":\n" +
                        ele.id() +
                        "\n(" +
                        new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 0,
                          useGrouping: false,
                        }).format(ele.position("x")) +
                        "," +
                        new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 0,
                          useGrouping: false,
                        }).format(ele.position("y")) +
                        ")"
                      );
                    },
                    "font-size": "17",
                    "text-opacity": (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return 0.25;
                      }

                      return 1;
                    },
                    "text-wrap": "wrap",
                    "text-valign": (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return "center";
                      }
                      return "bottom";
                    },
                    "text-margin-y": "5",
                    "text-transform": "uppercase",
                    "text-outline-opacity": "1",
                    "text-outline-color": "#0FA3B1",
                    "text-outline-width": ".1",
                    color: (ele) => {
                      if (ele.data("nodeType") === "ANNOTATION") {
                        return "#aaaaaa";
                      }

                      return "#C7F2A7";
                    },
                    "z-index": (ele) => {
                      const nodeType = ele.data("nodeType");
                      if (nodeType === "ANNOTATION") {
                        return 0;
                      } else if (nodeType === "EVALUATION") {
                        return 1;
                      } else {
                        return 5;
                      }
                    },
                    "z-index-compare": "manual",
                  },
                },
                {
                  selector: "edge",
                  style: {
                    width: 5,
                    color: "#4E937A",
                    opacity: 0.75,
                    "font-size": "15",
                    "text-justification": "center",
                    "text-margin-x": "-10",
                    "text-margin-y": "20",
                    "text-rotation": "autorotate",
                    "text-wrap": "wrap",
                    "text-valign": "bottom",
                    label: (ele) =>
                      "x:" +
                      new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 0,
                        useGrouping: false,
                      }).format(
                        ele.target().position("x") - ele.source().position("x")
                      ) +
                      "\n" +
                      "y:" +
                      new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 0,
                        useGrouping: false,
                      }).format(
                        ele.target().position("y") - ele.source().position("y")
                      ),
                    "line-color": "#0A81D1",
                    "line-opacity": 1,
                    "target-arrow-color": "#000",
                    "target-arrow-shape": "triangle-backcurve",
                    "curve-style": "bezier",
                    "source-endpoint": "outside-to-line-or-label",
                    "target-endpoint": "outside-to-line-or-label",
                    "source-distance-from-node": "10",
                    "target-distance-from-node": "1",
                    "arrow-scale": 2,
                    "z-index": 2,
                    "z-index-compare": "manual",
                  },
                },
              ]}
            />
          </Col>
          <Col xs={3} lg={2} className="p-0 m-0">
            <Row className="py-1 px-0 m-0">
              <Col xs={12} className="px-0 py-3 m-0">
                <Form className="px-0 m-0">
                  <Row className="pt-2 px-0 m-0 gap-1 justify-content-center">
                    <Col xs={12} className="p-0 pb-2 m-0">
                      <Form.Floating className="">
                        <Form.Label
                          className="text-center"
                          placeholder=".01"
                          style={{ paddingBottom: "10vh" }}
                        >
                          <p className="text-light w-100 text-wrap text-xs-start text-md-center">
                            <small>t: </small>
                            {aniDur}s
                          </p>
                        </Form.Label>
                        <Form.Range
                          value={aniDur}
                          min={minAnimationDuration}
                          max={maxAnimationDuration}
                          step={0.01}
                          onChange={(e) => onAnimationDurationChange(e)}
                        />
                      </Form.Floating>
                    </Col>
                    <Col xs={12} className="p-0  m-0 ">
                      <div className="d-grid w-100 p-0  m-0 ">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => watchBeautiflowify(e)}
                        >
                          Beautiflowify
                        </Button>
                      </div>
                    </Col>
                    <Col xs={12} className="py-5 px-0">
                      <Form.Group controlId="formFileLg" className="">
                        <Form.Label className="text-light small m-0">
                          Upload JSON
                        </Form.Label>
                        <Form.Control
                          type="file"
                          size="sm"
                          onChange={(e) => loadFlowJSONFromFile(e)}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} className="pb-3 px-0">
                      <div className="d-grid gap-1">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => exportToDVJSON(e)}
                        >
                          Export
                        </Button>
                      </div>
                    </Col>
                    <Col xs={12} className="p-0">
                      <div className="d-grid gap-1">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={(e) => clear(e)}
                        >
                          Clear
                        </Button>
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
                </Form>
              </Col>
            </Row>
            <Row className="p-0 m-0" style={{ minHeight: "50vh" }}>
              <Col
                xs={12}
                className="p-0 m-0 justify-content-end align-content-end"
              >
                <Accordion
                  flush
                  className="h-100 px-0 m-0 text-light bs-headings-color-light"
                  defaultActiveKey="0"
                  onSelect={(eKey) => toggleAccordion(eKey)}
                >
                  <Accordion.Item
                    eventKey="0"
                    className="h-100 px-0 m-0 bs-text-light bs-headings-color-light"
                  >
                    <Card className="h-100 bg-dark px-0 m-0">
                      <Card.Header className="p-0 m-0">
                        <CustomToggle
                          className="px-0 m-0"
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
            </Row>
            <Row className="align-content-end align-self-end">
              <Col xs={12}>
                <p className="text-light text-center mb-0 mt-3">
                  <small>*work in progress</small>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <Row className="pt-5 justify-content-center align-content-center">
          <Col xs={12} className="pt-5">
            <h1 className="display-1 text-light text-center">
              Import a DV flow JSON export file to get started!
            </h1>
          </Col>
          <Col xs={8} className="py-5 m-5">
            <Form className="pb-5 m-5">
              <Form.Group controlId="formFileLg" className="mb-3">
                <Form.Label>Large file input example</Form.Label>
                <Form.Control
                  type="file"
                  size="lg"
                  onChange={(e) => loadFlowJSONFromFile(e)}
                />
              </Form.Group>
            </Form>
          </Col>
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
      )}
    </Container>
  );
}

export default App;
