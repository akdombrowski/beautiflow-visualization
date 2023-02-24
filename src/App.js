import logo from "./logo.svg";
import "./App.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useState, useEffect, useRef } from "react";
import {
  createCytoscapeGraphForViz,
  readFlowJSONFileWithFileReader,
  getCopyOfElementsObj,
  convertStrToJSON,
  spaceHorizontallyWithAnimation,
} from "./Cy";
import CytoscapeComponent from "react-cytoscapejs";

function App() {
  const [file, setFile] = useState("");
  const [flowJSON, setFlowJSON] = useState("");
  const [elements, setElements] = useState("");
  const cyRef = useRef(null);
  const cyContainerID = "cyContainer";
  const filename =
    "/home/adombrowski/workspace/beautiflowify/testFlows/WO_subflow_condensed_columns and rows - Beautiflow - Demo 3 - PingOne Sign-On, Password Forgot and Reset, User Registration_Export_2023-02-19T14_27_48.361Z.json";

  const previewFile = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setFlowJSON(convertStrToJSON(text));
    };
    reader.readAsText(e.target.files[0]);
  };

  const space = (e) => {
    e.preventDefault();
    if (cyRef.current) {
      spaceHorizontallyWithAnimation(cyRef.current, 150, 330);
    }
  };

  useEffect(() => {
    if (flowJSON) {
      setElements(getCopyOfElementsObj(flowJSON));
    }
  }, [flowJSON]);

  return (
    <Container fluid className="bg-dark">
      <Row>
        <Col xs={12} id="cyContainerCol" style={{ height: "80vh" }}>
          {elements ? (
            <CytoscapeComponent
              elements={CytoscapeComponent.normalizeElements(elements)}
              layout={{ name: "preset" }}
              style={{ width: "100vw", height: "80vh" }}
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
                    label: (ele) => ele.data("nodeType").slice(0, 4),
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
      <Row>
        <Col>
          <input type="file" onChange={(e) => previewFile(e)} />
          <br />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <Button variant="light">BFS</Button>
        </Col>
        <Col xs={6}>
          <Button variant="light" onClick={(e) => space(e)}>
            Space
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
