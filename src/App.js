import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
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
import ErrorScreen from "./ErrorScreen.jsx";

function App() {
  const defaultAnimationDuration = 0.01;
  const maxAnimationDuration = 3;
  const minAnimationDuration = 0.01;
  const cyRef = useRef(null);
  const fileRef = useRef(null);
  const flowsRef = useRef(null);
  const flowJSONRef = useRef(null);
  const cloneElesRef = useRef(null);
  const [elesForCyInit, setElesForCyInit] = useState(null);
  const [ogElesClone, setOGElesClone] = useState(null);
  const [aniText, setAniText] = useState("Ready!");
  const [aniDescriptionText, setAniDescriptionText] = useState("");
  const [annosShifted, setAnnosShifted] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [aniDur, setAniDur] = useState(defaultAnimationDuration);
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

  const handleFileInputLabelClick = (e) => {
    e.preventDefault();
    document.querySelector("#fileInput").click();
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
      try {
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
      } catch (err) {
        setDoesFlowCauseError(true);
        setFlowErrorMessage(err);
      }
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
    if (importFlowError) {
      console.log("Copy both the message and cause below if reporting...");
      console.log();
      console.log("Error message:");
      console.log(importFlowError);
      console.log("Error cause:");
      console.log(importFlowError.cause);
    }
  }, [importFlowError]);

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

  if (doesFlowCauseError) {
    return <ErrorScreen clearErr={clearErr}></ErrorScreen>;
  }

  try {
    return (
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
                          return 75;
                        }

                        if (ele.data("nodeType") === "ANNOTATION") {
                          return ele.data("properties").width
                            ? ele.data("properties").width.value
                            : 300;
                        }

                        return 40;
                      },
                      height: (ele) => {
                        if (ele.data("nodeType") === "CONNECTION") {
                          return 75;
                        }

                        if (ele.data("nodeType") === "ANNOTATION") {
                          const h = ele.data("properties").height?.value;
                          return h ? 25 : 20;
                        }

                        return 40;
                      },
                      "background-opacity": (ele) => {
                        if (ele.data("nodeType") === "ANNOTATION") {
                          return 0.4;
                        }

                        return 1;
                      },
                      "background-color": (ele) => {
                        const props = ele.data("properties");
                        const readBGColor = props
                          ? props.backgroundColor
                          : null;
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

                        const props = ele.data("properties");
                        let title;
                        if (props) {
                          title = props.nodeTitle?.value;
                        }

                        const name = ele.data("name");

                        let firstRowLabel = title || name;
                        return (
                          (firstRowLabel ? firstRowLabel : "") +
                          "\n" +
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
                      "font-size": (ele) => {
                        if (ele.data("nodeType") === "CONNECTION") {
                          return 20;
                        }
                        return 15;
                      },
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
                      "text-margin-y": (ele) => {
                        if (ele.data("nodeType") === "CONNECTION") {
                          return 5;
                        }
                        return 0;
                      },
                      "text-transform": "lowercase",
                      "text-outline-opacity": "1",
                      "text-outline-color": "#F0F66E",
                      "text-outline-width": 0.1,
                      "text-max-width": 200,
                      "line-height": 1.1,
                      color: (ele) => {
                        if (ele.data("nodeType") === "ANNOTATION") {
                          return "#aaaaaa";
                        }

                        return "#FAFAFF";
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
                        "\u0394" +
                        "x:" +
                        new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 0,
                          useGrouping: false,
                        }).format(
                          ele.target().position("x") -
                            ele.source().position("x")
                        ) +
                        "\n" +
                        "\u0394" +
                        "y:" +
                        new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 0,
                          useGrouping: false,
                        }).format(
                          ele.target().position("y") -
                            ele.source().position("y")
                        ),
                      "line-color": "#0A81D1",
                      "line-opacity": 1,
                      "target-arrow-color": "#000",
                      "target-arrow-shape": "triangle-backcurve",
                      "curve-style": "bezier",
                      "source-endpoint": "outside-to-line-or-label",
                      "target-endpoint": "outside-to-line-or-label",
                      "source-distance-from-node": 3,
                      "target-distance-from-node": 1,
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
                        <div className="d-grid w-100 p-0 m-0">
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
                            style={{ backgroundColor: "var(--bs-dark)" }}
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
                  <p className="text-light text-end fixed-bottom pe-3 mb-1">
                    <small>*work in progress</small>
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        ) : (
          <Row className="p-0 m-0 h-100">
            <Col xs={12}>
              <Row id="beautiflowifyTitle" className="justify-content-center">
                <Col xs="auto">
                  <h1 className="display-1 text-light fw-bolder">
                    Beautfilow<i>-ify</i>
                  </h1>
                </Col>
              </Row>
            </Col>

            <Col xs={12}>
              <Row id="fileImportContainer" className="justify-content-center">
                <Col xs={10}>
                  <Form>
                    <Form.Group controlId="formFileLg" className="">
                      <Form.Label className="pb-1">
                        <h6 className="display-5 text-info text-center">
                          Import a JSON export of a DV flow to make it{" "}
                          <b>
                            <i>beautiflow</i>
                          </b>
                          !
                        </h6>
                      </Form.Label>
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

            <Col xs={12}>
              <Row
                id="textExplainationRow"
                className="justify-content-center px-5"
              >
                <Col xs={10} lg={6}>
                  <Row className="justify-content-center">
                    <Col xs={12}>
                      <p className="fs-5 p-0 text-light text-center font-monospace fw-lighter text-break">
                        Okay, so beauty is in the eye of the beholder...
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <p className="fs-6 p-0 text-light text-start font-monospace fw-lighter text-break">
                        This will 🤞 <i>attempt</i> to space nodes out nicely
                        (ignoring annotations) in DaVinci flows while trying to
                        preserve the relative ordering of nodes. Then, you can
                        export from here and import that into DV and have a
                        nicely spaced flow. However, there are some caveats and
                        there will be bugs.
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <ul>
                        <li>
                          <p className="fs-6 p-0 text-warning text-start font-monospace fw-lighter text-break">
                            Only import flows that do <b>not</b> contain any
                            subflows. i.e., don't include subflows when
                            downloading a flow JSON from DV. Instead, download
                            them separately and run each one through here.
                          </p>
                        </li>
                        <li>
                          <p className="fs-6 p-0 text-warning text-start font-monospace fw-lighter text-break">
                            It's recommended to run this in between building
                            your flow and adding annotations since this leaves
                            annotations in their original positions. But, hey,
                            go wild. Do whatever you want.
                          </p>
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col xs={12}>
              <Row id="buttonDefnsTable" className="justify-content-center p-0">
                <Col xs={10} lg={6}>
                  <dl className="row p-0 m-0">
                    <dt className="col-3">
                      <h5 className="font-monospace fw-bold m-0 text-info text-start text-break text-wrap">
                        Beautiflowify
                      </h5>
                    </dt>
                    <dd className="col-9">
                      <p className="fs-6 m-0 text-info text-start font-monospace  text-wrap">
                        Attempts to space nodes out nicely according to
                        standardized spacing.
                      </p>
                    </dd>

                    <dt className="col-3">
                      <p className="fs-7 m-0 text-info text-start font-monospace  text-wrap">
                        Export
                      </p>
                    </dt>
                    <dd className="col-9 ">
                      <p className="fs-8 m-0 text-info text-start font-monospace text-wrap">
                        Exports an updated JSON file that you can upload to
                        DaVinci.
                      </p>
                    </dd>

                    <dt className="col-3">
                      <p className="fs-7 m-0 text-info text-start font-monospace  text-wrap">
                        Clear
                      </p>
                    </dt>
                    <dd className="col-9 ">
                      <p className="fs-8 m-0 text-info text-start font-monospace  text-wrap">
                        Wipes out the nodes and brings you back to this screen.
                      </p>
                    </dd>

                    <dt className="col-3">
                      <p className="fs-7 m-0 text-info text-start font-monospace  text-wrap">
                        Reset
                      </p>
                    </dt>
                    <dd className="col-9">
                      <p className="fs-8 m-0 text-info text-start font-monospace  text-wrap">
                        Reset attempts to set nodes at their original positions.
                        Warning: animations might continue to run in the
                        background.
                      </p>
                    </dd>

                    {/* <dt className="col-3">
                    <p className="fs-8 m-0 text-info text-start font-monospace fw-lighter text-wrap">
                      tips
                      </p>
                  </dt>
                  <dd className="col-9">
                    <p className="fs-7 m-0 text-info text-start font-monospace fw-lighter text-wrap">
                      Use flows without included subflows (i.e., download
                      subflows separately)
                    </p>
                  </dd> */}
                  </dl>
                </Col>
              </Row>
            </Col>

            <Col xs={12}>
              <div className="fixed-bottom">
                <p className="text-secondary text-end pe-3">
                  <small>*work in progress</small>
                </p>
              </div>
            </Col>

            <Modal
              centered
              className=""
              size="lg"
              show={show}
              onHide={handleClose}
            >
              <Modal.Header closeButton className="bg-dark">
                <Modal.Title className="text-warning">
                  <h1>Ahh! The file contains multiple flows!</h1>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-light bg-dark px-5 py-4">
                <h5>The uploaded file contains multiple flows.</h5>
                <h6>
                  Using this file is{" "}
                  <b>
                    <i>not</i>
                  </b>{" "}
                  recommended.
                </h6>
                <h6>What's going to happen if you do, you ask?</h6>
                <h6>
                  Stuff.{" "}
                  <b>
                    <i>Serious</i>
                  </b>{" "}
                  stuff. Ok? Okay?!?!? Ok.
                </h6>
                <p className="p-0 m-0 text-wrap text-break">
                  It'll try to find the parent flow and use that. If it can't
                  figure out which one is the parent (weird situation), then
                  it'll default to the first flow in the file.{" "}
                </p>
                <p className="p-0 m-0 text-wrap text-break">
                  Try downloading the flows separately (without including
                  subflows) and work with each of them in turn.
                </p>
              </Modal.Body>
              <Modal.Footer className="bg-dark">
                <Container fluid>
                  <Row xs={2} className="w-100 justify-content-between m-0">
                    <Col>
                      <div className="d-grid h-100 w-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleContinueAnyways}
                        >
                          <Row className="h-100 w-100 m-0 justify-content-center">
                            <Col xs={12}>
                              <h4 className="p-0 m-0 text-wrap text-break text-center">
                                Continue Anyways
                              </h4>
                            </Col>
                            <Col xs={12}>
                              <p className="p-0 m-0 fs-10 fw-lighter text-wrap text-break text-center">
                                (are you seriously going to go through with
                                this?)
                              </p>
                            </Col>
                          </Row>
                        </Button>
                      </div>
                    </Col>
                    <Col>
                      <div className="d-grid h-100 w-100">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleClose}
                        >
                          <Row className="h-100 w-100 m-0 justify-content-between">
                            <Col xs={12}>
                              <h4 className="p-0 m-0 text-wrap text-break text-center">
                                Import a different flow
                              </h4>
                            </Col>
                            <Col xs={12}>
                              <p className="p-0 m-0 fs-10 fw-lighter text-wrap text-break text-center">
                                (coward's way out)
                              </p>
                            </Col>
                          </Row>
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </Modal.Footer>
            </Modal>
          </Row>
        )}
      </Container>
    );
  } catch (err) {
    return (
      <ErrorScreen
        clearErr={(e) => {
          setFlowErrorMessage(err);
          clearErr(e);
        }}
      ></ErrorScreen>
    );
  }
}

export default App;
