import { useState, forwardRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import Overlay from "react-bootstrap/Overlay";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Badge from "react-bootstrap/Badge";
import Container from "react-bootstrap/Container";
import CustomToggle from "./CustomToggle.jsx";
import { beautiflowify } from "./cy.js";

const FlowFormattingUX = forwardRef(function FlowFormattingUX(
  { elesForCyInit, loadFlowJSONFromFile, exportToDVJSON, clear, reset },
  cyRef
) {
  const defaultAnimationDuration = 1;
  const maxAnimationDuration = 1000;
  const minAnimationDuration = 1;
  const [aniDur, setAniDur] = useState(defaultAnimationDuration);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [aniDescriptionText, setAniDescriptionText] = useState("");
  const [aniText, setAniText] = useState("Ready!");
  const [xSpacing, setXSpacing] = useState(150);
  const [ySpacing, setYSpacing] = useState(330);
  const [annosXBuffer, setAnnosXBuffer] = useState(600);
  const [annosYBuffer, setAnnosYBuffer] = useState(0);
  const [moveAnnotations, setMoveAnnotations] = useState(false);

  const toggleAccordion = () => {
    const currAccState = !isAccordionOpen;
    setIsAccordionOpen(currAccState);
  };

  const onXSpacingChange = (e) => {
    e.preventDefault();
    setXSpacing(Number(e.currentTarget.value));
  };

  const onYSpacingChange = (e) => {
    e.preventDefault();
    setYSpacing(Number(e.currentTarget.value));
  };

  const onMoveAnnotationsChange = (move) => {
    setMoveAnnotations(move);
  };

  const onAnnosXBufferChange = (e) => {
    e.preventDefault();
    setAnnosXBuffer(Number(e.currentTarget.value));
  };

  const onAnnosYBufferChange = (e) => {
    e.preventDefault();
    setAnnosYBuffer(Number(e.currentTarget.value));
  };

  const onAnimationDurationChange = (e) => {
    e.preventDefault();
    setAniDur(Number(e.currentTarget.value));
  };

  const renderTooltipNodeSpacing = (props) => (
    <Tooltip id="button-tooltip" className="text-light" {...props}>
      <p className="text-white">
        Adjust these values to control the spacing between nodes
      </p>
    </Tooltip>
  );

  const renderTooltipAnnotationsSpacing = (props) => (
    <Tooltip id="button-tooltip" className="text-light" {...props}>
      <p className="text-white">
        Switch the toggle on if you want to make sure that annotations and nodes
        don't overlap. Additionally, you can control how far they are separated
        via these values
      </p>
    </Tooltip>
  );

  const renderTooltipAnimationDurationMillis = (props) => (
    <Tooltip id="button-tooltip" className="text-light" {...props}>
      <p className="text-white">
        Greater values will slow down the animation. You can also analyze what's
        happening while at slower speeds by clicking on <i>Description</i> down
        below
      </p>
    </Tooltip>
  );

  const formatSpacing = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      beautiflowify({
        cy: cyRef.current,
        xSpacing: minXSpacing,
        ySpacing: minYSpacing,
        verticalTolerance: 330,
        durMillis: aniDur,
        watchAnimation: true,
        annotations: {
          move: moveAnnotations,
          shiftValX: annosXBuffer,
          shiftValY: annosYBuffer,
        },
      });
    }
  };

  const watchBeautiflowify = (e) => {
    e.preventDefault();

    // Use min spacing values user-entered value is lower
    const minXSpacing = Math.max(xSpacing, 50);
    const minYSpacing = Math.max(ySpacing, 100);

    // If min x spacing was used, update the state value
    if (xSpacing !== minXSpacing) {
      setXSpacing(minXSpacing);
    }

    // If min y spacing was used, update the state value
    if (ySpacing !== minYSpacing) {
      setYSpacing(minYSpacing);
    }

    if (cyRef.current) {
      // beautiflowify(cyRef.current, minXSpacing, 330, aniDur, true, minYSpacing);
      beautiflowify({
        cy: cyRef.current,
        xSpacing: minXSpacing,
        ySpacing: minYSpacing,
        verticalTolerance: 330,
        durMillis: aniDur,
        watchAnimation: true,
        annotations: {
          move: moveAnnotations,
          shiftValX: annosXBuffer,
          shiftValY: annosYBuffer,
        },
      });
    }
  };

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
                    ele.target().position("x") - ele.source().position("x")
                  ) +
                  "\n" +
                  "\u0394" +
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
                <Col xs={12} className="p-0 m-0">
                  <Row className="w-100 h-100 m-0 p-0">
                    <Col xs={12} className="p-0 m-0 d-flex flex-column">
                      <InputGroup>
                        <Row className="w-100 m-0">
                          <Col xs={6} className="p-0 ">
                            <InputGroup.Text
                              id="label"
                              className="bg-dark p-1 rounded-0 border-secondary"
                            >
                              <p className="fs-6 text-light w-100 text-wrap text-center p-0 m-0">
                                Horizontal
                                <br />
                                Spacing{"  "}
                              </p>
                            </InputGroup.Text>
                          </Col>
                          <Col xs={6} className="p-0 h-100">
                            <Form.Control
                              id="xSpacing"
                              type="number"
                              value={xSpacing}
                              onChange={(e) => onXSpacingChange(e)}
                              className="h-100 fs-6 text-center p-1 m-0 rounded-0 border-secondary"
                            ></Form.Control>
                          </Col>
                        </Row>
                      </InputGroup>
                    </Col>
                    <Col xs={12} className="p-0 m-0 d-flex flex-column">
                      <InputGroup>
                        <Row className="w-100 m-0">
                          <Col xs={6} className="p-0 ">
                            <InputGroup.Text
                              id="label"
                              className="bg-dark p-1 rounded-0 border-secondary"
                            >
                              <p className="fs-6 text-light w-100 text-wrap text-center p-0 m-0">
                                Vertical
                                <br /> Spacing
                              </p>
                            </InputGroup.Text>
                          </Col>
                          <Col xs={6} className="p-0 h-100">
                            <Form.Control
                              id="ySpacing"
                              type="number"
                              value={ySpacing}
                              onChange={(e) => onYSpacingChange(e)}
                              className="h-100 fs-6 text-center p-1 m-0 rounded-0 border-secondary"
                            ></Form.Control>
                          </Col>
                        </Row>
                      </InputGroup>
                    </Col>
                    <Col xs={12} className="p-0 m-0 d-flex flex-column">
                      <Row className="m-0 p-0">
                        <Col xs={10} className="m-0 p-0"></Col>
                        <Col
                          xs={2}
                          className="m-0 p-0 justify-content-end d-flex"
                        >
                          <OverlayTrigger
                            placement="left"
                            delay={{ show: 200, hide: 800 }}
                            overlay={renderTooltipNodeSpacing}
                          >
                            {({ ref, ...triggerHandler }) => (
                              <Button
                                {...triggerHandler}
                                className="p-0 m-0 d-inline-flex align-items-center"
                              >
                                <Badge
                                  ref={ref}
                                  pill
                                  bg="secondary"
                                  className="fs-8 text-light"
                                >
                                  ?
                                </Badge>
                              </Button>
                            )}
                          </OverlayTrigger>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>

                <Col xs={12} className="p-0 pt-4 m-0">
                  <Row className="w-100 h-100 m-0 p-0">
                    <Col xs={12} className="p-0 pb-1 m-0 d-flex flex-column">
                      <ToggleButtonGroup
                        type="radio"
                        name="options"
                        value={moveAnnotations}
                        onChange={onMoveAnnotationsChange}
                      >
                        <ToggleButton
                          id="toggle-on"
                          value={true}
                          variant="outline-success"
                          className="rounded-0"
                        >
                          On
                        </ToggleButton>
                        <ToggleButton
                          id="toggle-off"
                          value={false}
                          variant="outline-danger"
                          className="rounded-0"
                        >
                          Off
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Col>
                    <Col xs={12} className="p-0 pb-1 m-0 d-flex flex-column">
                      <InputGroup>
                        <Row className="w-100 m-0">
                          <Col xs={7} className="p-0 ">
                            <InputGroup.Text
                              id="label"
                              className="bg-dark p-1 rounded-0 border-secondary"
                            >
                              <p className="fs-6 text-light w-100 text-wrap text-center p-0 m-0">
                                Annotations
                                <br /> x-Buffer
                              </p>
                            </InputGroup.Text>
                          </Col>
                          <Col xs={5} className="p-0 h-100">
                            <Form.Control
                              id="annosXBuffer"
                              type="number"
                              value={annosXBuffer}
                              onChange={(e) => onAnnosXBufferChange(e)}
                              className="h-100 fs-6 text-center p-1 m-0 rounded-0 border-secondary"
                            ></Form.Control>
                          </Col>
                        </Row>
                      </InputGroup>
                    </Col>
                    <Col xs={12} className="p-0 m-0 d-flex flex-column">
                      <InputGroup>
                        <Row className="w-100 m-0">
                          <Col xs={7} className="p-0 ">
                            <InputGroup.Text
                              id="label"
                              className="bg-dark p-1 rounded-0 border-secondary"
                            >
                              <p className="fs-6 text-light w-100 text-wrap text-center p-0 m-0">
                                Annotations
                                <br /> y-Buffer
                              </p>
                            </InputGroup.Text>
                          </Col>
                          <Col xs={5} className="p-0 h-100">
                            <Form.Control
                              id="annosYBuffer"
                              type="number"
                              value={annosYBuffer}
                              onChange={(e) => onAnnosYBufferChange(e)}
                              className="h-100 fs-6 text-center p-1 m-0 rounded-0 border-secondary"
                            ></Form.Control>
                          </Col>
                        </Row>
                      </InputGroup>
                    </Col>
                    <Col xs={12} className="p-0 m-0 d-flex flex-column">
                      <Row className="m-0 p-0">
                        <Col xs={10} className="m-0 p-0"></Col>
                        <Col
                          xs={2}
                          className="m-0 p-0 justify-content-end d-flex"
                        >
                          <OverlayTrigger
                            placement="left"
                            delay={{ show: 200, hide: 800 }}
                            overlay={renderTooltipAnnotationsSpacing}
                          >
                            {({ ref, ...triggerHandler }) => (
                              <Button
                                {...triggerHandler}
                                className="p-0 m-0 d-inline-flex align-items-center"
                              >
                                <Badge
                                  ref={ref}
                                  pill
                                  bg="secondary"
                                  className="fs-8 text-light"
                                >
                                  ?
                                </Badge>
                              </Button>
                            )}
                          </OverlayTrigger>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>

                <Col xs={12} className="p-0 pt-5 m-0">
                  <Form.Floating className="p-0">
                    <Form.Label
                      className="text-center pt-4"
                      placeholder=".01"
                      style={{ paddingBottom: "2.5rem" }}
                    >
                      <p className="p-0 m-0 text-light w-100 text-wrap text-xs-start text-md-center">
                        <small>t: </small>
                        {aniDur}ms
                      </p>
                    </Form.Label>
                    <Form.Range
                      value={aniDur}
                      min={minAnimationDuration}
                      max={maxAnimationDuration}
                      step={1}
                      onChange={(e) => onAnimationDurationChange(e)}
                    />
                  </Form.Floating>
                </Col>
                <Col xs={12} className="p-0 pb-5 m-0 d-flex flex-column">
                  <Row className="m-0 p-0">
                    <Col xs={10} className="m-0 p-0"></Col>
                    <Col xs={2} className="m-0 p-0 justify-content-end d-flex">
                      <OverlayTrigger
                        placement="left"
                        delay={{ show: 200, hide: 800 }}
                        overlay={renderTooltipAnimationDurationMillis}
                      >
                        {({ ref, ...triggerHandler }) => (
                          <Button
                            {...triggerHandler}
                            className="p-0 m-0 d-inline-flex align-items-center"
                          >
                            <Badge
                              ref={ref}
                              pill
                              bg="secondary"
                              className="fs-8 text-light"
                            >
                              ?
                            </Badge>
                          </Button>
                        )}
                      </OverlayTrigger>
                    </Col>
                  </Row>
                </Col>

                <Col xs={12} className="p-0 m-0">
                  <div className="d-grid w-100 p-0 m-0">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={(e) => watchBeautiflowify(e)}
                    >
                      <p className="p-0 py-2 m-0 fs-5 fw-bold">Beautiflowify</p>
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
        <Row className="p-0 m-0">
          <Col
            xs={12}
            className="p-0 m-0 justify-content-end align-content-end"
          >
            <Accordion
              flush
              className="h-100 px-0 m-0"
              onSelect={(eKey) => toggleAccordion(eKey)}
            >
              <Accordion.Item eventKey="0" className="h-100 px-0 m-0">
                <Card className="h-100 bg-dark px-0 m-0">
                  <Card.Header className="p-0 m-0">
                    <CustomToggle
                      className="px-0 m-0"
                      eventKey="0"
                      setAccordionCollapsedState={toggleAccordion}
                    >
                      <p className="p-0 m-0 text-info">Description</p>
                    </CustomToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>
                      <Stack style={{ minHeight: "8vh", height: "100%" }}>
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
            <p className="text-info text-end fixed-bottom pe-5 mb-1">
              <small>@dombrowski</small>
            </p>
          </Col>
        </Row>
      </Col>
    </Row>
  );
});

export default FlowFormattingUX;
