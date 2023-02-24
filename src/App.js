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
  let cyRef = useRef(null);
  const cyContainerID = "cyContainer";
  const filename =
    "/home/adombrowski/workspace/beautiflowify/testFlows/WO_subflow_condensed_columns and rows - Beautiflow - Demo 3 - PingOne Sign-On, Password Forgot and Reset, User Registration_Export_2023-02-19T14_27_48.361Z.json";

  const previewFile = async (e) => {
    // const fileInput = document.querySelector("input[type=file]");
    // let fileRead;
    // if (fileInput) {
    //   [fileRead] = fileInput.files;
    // }
    // const reader = new FileReader();

    // reader.addEventListener(
    //   "load",
    //   () => {
    //     // this will then display a text file
    //     setFile(reader.result);
    //   },
    //   false
    // );

    // if (fileRead) {
    //   reader.readAsText(file);
    // }
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      console.log(text);
      setFlowJSON(convertStrToJSON(text));
    };
    reader.readAsText(e.target.files[0]);
  };

  const space = (e) => {
    e.preventDefault();
    if (cyRef) {
      spaceHorizontallyWithAnimation(cyRef, 150, 330);
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
              style={{ width: "100vw", height: "80vh" }}
              cy={(cy) => {
                cyRef = cy;
              }}
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
