import cytoscape from "cytoscape";
// import { readFileSync, writeFileSync } from "fs";

export const convertStrToJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    throw new SyntaxError("Content needs to be of JSON", { cause: e });
  }
};

// export const readFlowJSONFile = async (filename) => {
//   console.log("Reading flow json from file... ", filename);
//   if (!filename.endsWith(".json")) {
//     const errMsg = "Must use a JSON file (filename ends with .json).";
//     console.error(errMsg);
//     throw new Error(errMsg);
//   }

//   let data = await readFileSync(filename, "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//       throw new Error("Couldn't read file contents", { cause: err });
//     }

//     return data;
//   });

//   const flowJSON = convertStrToJSON(data);

//   return flowJSON;
// };

export const readFlowJSONFileWithFileReader = async (filename) => {
  console.log("Reading flow json from file... ", filename);
  if (!filename.endsWith(".json")) {
    const errMsg = "Must use a JSON file (filename ends with .json).";
    console.error(errMsg);
    throw new Error(errMsg);
  }

  const blob = new Blob(new Array());
  const reader = new FileReader();
  const data = new File(blob, filename, {
    type: "text/plain",
  });
  reader.onload = (evt) => {
    console.log(evt.target.result);
    const flowJSON = convertStrToJSON(text);
    return flowJSON;
  };

  const text = reader.readAsText(data);
};

export const getGraphData = (flowJSON) => {
  try {
    return flowJSON.graphData;
  } catch (e) {
    throw new Error("Could not extract graph data", { cause: e });
  }
};

export const createElementsObjFromArrays = (nodesArr, edgesArr) => {
  return { nodes: nodesArr, edges: edgesArr };
};

export const getElements = (flowJSON) => {
  try {
    return getGraphData(flowJSON).elements;
  } catch (e) {
    throw new Error("Could not extract elements.", { cause: e });
  }
};

export const getNodes = (flowJSON) => {
  try {
    return getElements(flowJSON).nodes;
  } catch (e) {
    throw new Error("Could not extract nodes.", { cause: e });
  }
};

export const getEdges = (flowJSON) => {
  try {
    return getElements(flowJSON).edges;
  } catch (e) {
    throw new Error("Could not extract edges.", { cause: e });
  }
};

export const getCopyOfElementsObj = (flowJSON) => {
  try {
    const elementsCopy = JSON.parse(JSON.stringify(getElements(flowJSON)));
    console.log(elementsCopy);
    return elementsCopy;
  } catch (e) {
    throw new Error("Could not get a copy of elements.", { cause: e });
  }
};

export const getCopyOfNodesArr = (flowJSON) => {
  try {
    return getNodes(flowJSON).slice(0);
  } catch (e) {
    throw new Error("Could not get nodes to make a copy.", { cause: e });
  }
};

export const getCopyOfEdgesArr = (flowJSON) => {
  try {
    return getEdges(flowJSON).slice(0);
  } catch (e) {
    throw new Error("Could not get edges to make a copy.", { cause: e });
  }
};

export const getCopyOfAnnotationsArr = (flowJSON) => {
  try {
    const nodes = getNodes(flowJSON);
    return Array.filter(nodes, (n, i, nodes) => {
      return n.data.nodeType === "ANNOTATION";
    });
  } catch (e) {
    throw new Error("Could not extract annotations.", { cause: e });
  }
};

export const getCopyOfNodesArrWOAnnotations = (flowJSON) => {
  try {
    const nodes = getNodes(flowJSON);
    return Array.filter(nodes, (n, i, nodes) => {
      return n.data.nodeType !== "ANNOTATION";
    });
  } catch (e) {
    throw new Error("Could not get a copy of nodes without annotations.", {
      cause: e,
    });
  }
};

export const getCopyOfNodesArrWOAnnotationsFromNodes = (nodes) => {
  try {
    const nodesCopy = nodes.clone();
    const nodesCopyWOAnnotations = nodesCopy.filter(
      '[nodeType != "ANNOTATION"]'
    );
    return nodesCopyWOAnnotations;
  } catch (e) {
    throw new Error("Could not get a copy of nodes without annotations.", {
      cause: e,
    });
  }
};

export const getCopyOfElementsObjWOAnnotations = (flowJSON) => {
  try {
    const nodesWOAnnotationsCopy = getCopyOfNodesArrWOAnnotations(flowJSON);
    const edgesCopy = getCopyOfEdgesArr(flowJSON);
    return createElementsObjFromArrays(nodesWOAnnotationsCopy, edgesCopy);
  } catch (e) {
    throw new Error("Could not get a copy of elements without annotations.", {
      cause: e,
    });
  }
};

export const convertToBasicCyNodesArr = (nodes) => {
  const cyNodes = [];

  for (let n of nodes) {
    const cyNode = {
      group: "nodes",
    };
    const data = {
      id: n.data.id,
    };
    const position = {
      x: n.position.x,
      y: n.position.y,
    };
    cyNode.data = data;
    cyNode.position = position;
    cyNodes.push(cyNode);
  }

  return cyNodes;
};

export const convertToBasicCyEdgesArr = (edges) => {
  const cyEdges = [];

  for (let e of edges) {
    const cyEdge = {
      group: "edges",
    };
    const data = {
      id: e.data.id,
      source: e.data.source,
      target: e.data.target,
    };
    cyEdge.data = data;
    cyEdges.push(cyEdge);
  }

  return cyEdges;
};

export const convertToBasicNodesAndEdgesAndCreateCytoscapeGraph = (
  flowJSON
) => {
  const nodesCopy = getCopyOfNodesArr(flowJSON);
  const edgesCopy = getCopyOfEdgesArr(flowJSON);
  const cyNodes = convertToBasicCyNodesArr(nodesCopy);
  const cyEdges = convertToBasicCyEdgesArr(edgesCopy);
  const elements = cyNodes.concat(cyEdges);
  const cy = cytoscape({
    elements: elements,
    layout: "preset",
    headless: true,
    styleEnabled: false,
  });

  return cy;
};

export const createPosMapping = (flowJSON) => {
  const nodes = getCopyOfNodesArr(flowJSON);
  const posMapping = new Map();

  for (let n of nodes) {
    posMapping.set(n.data.id, { x: n.position.x, y: n.position.y });
  }

  return posMapping;
};

export const createCytoscapeGraph = (flowJSON) => {
  try {
    let parsedJSONFlow;
    try {
      parsedJSONFlow = convertStrToJSON(flowJSON);
    } catch (e) {
      parsedJSONFlow = flowJSON;
    }
    const elementsCopy = getCopyOfElementsObj(parsedJSONFlow);

    const cy = cytoscape({
      elements: elementsCopy,
      layout: { name: "preset" },
      headless: true,
      styleEnabled: false,
    });

    return cy;
  } catch (e) {
    throw new Error("Could not create cytoscape graph.", { cause: e });
  }
};

export const createCytoscapeGraphForViz = (flowJSON, containerID) => {
  try {
    let parsedJSONFlow;
    try {
      parsedJSONFlow = convertStrToJSON(flowJSON);
    } catch (e) {
      parsedJSONFlow = flowJSON;
    }

    const elementsCopy = getCopyOfElementsObj(parsedJSONFlow);
    const containerEl = document.getElementById(containerID);

    console.log(elementsCopy.jsons());

    const cy = cytoscape({
      container: containerEl,
      elements: elementsCopy,
      layout: { name: "preset" },
      headless: false,
      styleEnabled: true,
      style: [
        // the stylesheet for the graph
        {
          selector: "node",
          style: {
            "background-color": "#000",
            label: "data(id)",
          },
        },

        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });

    return cy;
  } catch (e) {
    throw new Error("Could not create cytoscape graph.", { cause: e });
  }
};

export const createCytoscapeGraphFromEles = async (elements) => {
  try {
    const cy = cytoscape({
      elements: new Promise((resolve, reject) => resolve(elements)),
      // positions: posMapping,
      // elements: () =>
      //   new Promise((resolve, reject) => {
      //     const elementsCopy = getCopyOfElementsObj(flowJSON);
      //     console.log("elementsCopy.nodes.length");
      //     console.log(elementsCopy.nodes.length);
      //     if (!elementsCopy || Object.values(elementsCopy).length === 0) {
      //       reject("No elements were found.");
      //     } else {
      //       resolve(elementsCopy);
      //     }
      //   }),
      layout: { name: "preset" },
      headless: true,
      styleEnabled: false,
    });

    return cy;
  } catch (e) {
    throw new Error("Could not create cytoscape graph.", { cause: e });
  }
};

export const removeAnnotationsFromCy = (cy) => {
  const cyWOAnnotations = cy.remove('[nodeType = "ANNOTATION"]');
  return cyWOAnnotations;
};

export const createCytoscapeGraphWOAnnotationsFromNodesEdgesArrays = (
  nodesArr,
  edgesArr
) => {
  try {
    return cytoscape({
      elements: () =>
        new Promise((resolve, reject) => {
          const elements = createElementsObjFromArrays(nodesArr, edgesArr);
          if (!elements || Object.values(elements).length === 0) {
            reject("No elements were found.");
          } else {
            resolve(elements);
          }
        }),
      layout: "preset",
      headless: true,
      styleEnabled: false,
    });
  } catch (e) {
    throw new Error("Could not create cytoscape graph.", { cause: e });
  }
};

export const createCytoscapeGraphWOAnnotations = (flowJSON) => {
  try {
    return cytoscape({
      elements: () =>
        new Promise((resolve, reject) => {
          const elementsCopy = getCopyOfElementsObjWOAnnotations(flowJSON);
          if (!elementsCopy || Object.values(elementsCopy).length === 0) {
            reject("No elements were found.");
          } else {
            resolve(getElements(flowJSON));
          }
        }),
      layout: "preset",
      headless: true,
      styleEnabled: false,
    });
  } catch (e) {
    throw new Error("Could not create cytoscape graph.", { cause: e });
  }
};

export const getMinXNode = (nodes) => {
  let minX = Number.POSITIVE_INFINITY;
  let minXNode;

  for (let n of nodes) {
    const x = n.position.x;
    if (x < minX) {
      minXNode = n;
      minX = x;
    }
  }

  return minXNode;
};

export const getMinYNode = (nodes) => {
  let minY = Number.POSITIVE_INFINITY;
  let minYNode;

  for (let n of nodes) {
    const y = n.position.y;
    if (y < minY) {
      minYNode = n;
      minY = y;
    }
  }

  return minYNode;
};

export const getMinXCyNode = (cyNodes) => {
  const minXCyNode = cyNodes.min((ele, i, eles) => {
    return ele.position("y");
  }).ele;

  return minXCyNode;
};

export const getMinYCyNode = (cyNodes) => {
  const minYCyNode = cyNodes.min((ele, i, eles) => {
    return ele.position("y");
  }).ele;

  return minYCyNode;
};

export const isEleYPosWithinToleranceOfY = (ele, y, tolerance) => {
  return ele.position.y < y + tolerance && ele.position.y > y - tolerance;
};

export const getNodesWithinYTolerance = (cy, y, tolerance) => {
  return cy.filter((ele, i, eles) => {
    if (!ele.isNode()) {
      return false;
    }

    if (ele.data.nodeType !== "CONNECTION") {
      return false;
    }

    if (
      ele.position.y > ele.position.y + tolerance ||
      ele.position.y < ele.position.y - tolerance
    ) {
      return false;
    }

    return true;
  });
};

export const shiftAnnotationRenderedPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');
  // can i run shift on a single node?
  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width.value;
    const newPosX = posX - width / 2;
    ele.position("x", newPosX);
  });

  return nodes;
};

export const getCyNodesInRowAtYPos = (cyNodes, y, tolerance) => {
  return cyNodes.filter((ele, i, eles) => {
    if (isEleYPosWithinToleranceOfY(ele.json(), y, tolerance)) {
      return true;
    }

    return false;
  });
};

export const getStartNode = (cyNodes, tolerance) => {
  const minY = cyNodes.min((ele, i, eles) => {
    return ele.position("y");
  });
  const minYPos = minY.value;
  const firstRowCyNodes = getCyNodesInRowAtYPos(cyNodes, minYPos, tolerance);
  let minX = Number.POSITIVE_INFINITY;
  const startCyNode = firstRowCyNodes.min((ele, i, eles) =>
    ele.position("x")
  ).ele;

  return startCyNode;
};

// try out nodes.shift()
export const normalizeNodePositions = (nodes) => {
  const nodesCopy = nodes.slice(0);
  const minX = getMinXNode(nodesCopy).position.x;
  const minY = getMinYNode(nodesCopy).position.y;

  for (let n of nodesCopy) {
    n.position.x -= minX;
    n.position.y -= minY;
  }

  return nodesCopy;
};

export const normalizeCyNodePos = (nodes) => {
  const minX = getMinXCyNode(nodes);
  const minXPos = minX.position("x");
  const minY = getMinYCyNode(nodes);
  const minYPos = minY.position("y");
  const xShift = -1 * minXPos;
  const yShift = -1 * minYPos;

  nodes.shift({ x: xShift, y: yShift });

  return nodes;
};

export const lockAnnotationPositions = (cy) => {
  cy.nodes('[nodeType = "ANNOTATION"]').lock();
};

export const spaceHorizontallyUsingCyGridLayout = (
  flowJSON,
  spacing,
  verticalTolerance
) => {
  const cy = createCytoscapeGraph(flowJSON);
  let options = {
    name: "grid",
    boundingBox: { x1: 0, y1: 0, w: 1920, h: 1080 },
    fit: false,
    padding: spacing,
    avoidOverlap: true,
    avoidOverlapPadding: spacing,
  };

  lockAnnotationPositions(cy);
  cy.layout(options).run();

  return cy;
};

export const sortNodes = (nodes, verticalTolerance) => {
  const nodesSorted = nodes.sort((ele1, ele2) => {
    const ele1X = ele1.position("x");
    const ele1Y = ele1.position("y");
    const ele2X = ele2.position("x");
    const ele2Y = ele2.position("y");
    const ele1NodeType = ele1.data.nodeType;
    const ele2NodeType = ele2.data.nodeType;

    if (ele1NodeType === "ANNOTATION") {
      return -1;
    }

    if (ele2NodeType === "ANNOTATION") {
      return 1;
    }

    if (ele1Y < ele2Y - verticalTolerance) {
      return -1;
    }

    if (ele2Y < ele1Y - verticalTolerance) {
      return 1;
    }

    if (ele2Y > ele1Y + verticalTolerance) {
      return -1;
    }

    if (ele1Y > ele2Y + verticalTolerance) {
      return 1;
    }

    if (ele1X < ele2X) {
      return -1;
    }

    return 1;
  });

  return nodesSorted;
};

export const getSourceNode = (cy, targetNodeID) => {
  const sourceNode = cy.$("#" + targetNodeID).incomers("node");
  return sourceNode;
};

// export const calcNodeRows = (nodes) => {
//   const rows = [];
//   let rowNum = 0;

//   nodes.forEach((ele, i, eles) => {
//     // rootsArr1.forEach((ele, i, eles) => {
//     nodes.filter('[nodeType != "ANNOTATION"]').breadthFirstSearch({
//       root: ele,
//       visit: (v, edge, prev, j, depth) => {
//         if (!prev) {
//           currRowPosY += nextRowYAdd;
//           v.position({ x: rowStartPosX, y: currRowPosY });
//         } else {
//           const prevNodePosX = prev.position("x");
//           const prevNodePosY = prev.position("y");
//           const currNodePosY = v.position("y");
//           const nextPosX = prevNodePosX + spacing;

//           if (v.id() === "bviv3cclyg") {
//             console.log();
//             console.log("currNode");
//             console.log(v.json());

//             console.log("prevNode");
//             console.log(prev.json());
//             console.log();
//           }
//           v.position("x", nextPosX);

//           // i think the diff calc is using the updated pos of the prev node, so it's not reliable
//           // calc row y pos ahead of time
//           if (currNodePosY - prevNodePosY > verticalTolerance) {
//             // 240 is where the next node should start accounting for space for an annotation above it with 150 spacing to that annotation from the row above
//             const nextPosY = prevNodePosY + 240;
//             const numberOfRowsBelow = Math.floor(
//               (currNodePosY - prevNodePosY) / verticalTolerance
//             );
//             v.position("y", nextPosY);
//           }
//         }
//       },
//       directed: true,
//     });
//   });
// };

export const animateSuccessorsOfEle = (ele) => {
  const anis = ele
    .successors()
    .filter("nodes")
    .map((el, i, els) => {
      const ani = el.animation(
        {
          style: { backgroundColor: "blue" },
        },
        {
          duration: 10000,
          complete: () => console.log("animated " + ele.id() + "'s successors"),
        }
      );
    });

  return anis;
};

export const animateNodesAndWait = async (els, dur, color) => {
  return Promise.all(
    els.map((ele, i, eles) => {
      return new Promise((resolve, reject) => {
        const ani = ele.animation(
          {
            style: { backgroundColor: color },
          },
          {
            duration: dur,
            complete: () => {
              // console.log("animated " + ele.id());
              resolve("animated " + ele.id());
            },
          }
        );
        ani.play();
        // await eles.pon("style");
      });
    })
  );
};

export const animateElesAndWait = async (els, dur, color) => {
  return Promise.all(
    els.map((ele, i, eles) => {
      return new Promise((resolve, reject) => {
        let sty;
        if (ele.isNode()) {
          sty = { backgroundColor: color };
        } else {
          sty = { "line-color": color };
        }
        const ani = ele.animation(
          {
            style: sty,
          },
          {
            duration: dur,
            complete: () => {
              // console.log("animated " + ele.id());
              resolve("animated " + ele.id());
            },
          }
        );
        ani.play();
        // await eles.pon("style");
      });
    })
  );
};

export const animateNodes = (nodes, dur, color) => {
  nodes.map((ele, i, eles) => {
    const ani = ele.animation(
      {
        style: { backgroundColor: color },
      },
      {
        duration: dur,
        complete: () => console.log(ele.id() + " animated"),
      }
    );
    ani.play();
    // await eles.pon("style");
  });
};

export const getRowOfNodesFromRoot = (root) => {
  const row = root.successors();
  return row.union(root);
};

/**
 * normalize nodes
 * lock annotations
 *
 * a)
 * get nodes of a row with cy.filter(function(ele, i, eles))
 *  using the function to capture nodes at a certain y position +- tolerance
 * run grid layout on that row with eles.layout(options)
 * or
 * b)
 * start at first node find the node it targets by its connecting edge,
 * add spacing to target node x position
 *
 *  repeat on next row of nodes
 **/
export const spaceHorizontally = async (
  flowJSON,
  spacing,
  verticalTolerance
) => {
  const cy = createCytoscapeGraph(flowJSON);

  console.log(cy.getElementById("bviv3cclyg").json());

  const cyBeforeRepositioning = createCytoscapeGraph(flowJSON);
  const nodes = cy.nodes();
  const nodesOG = nodes.clone();
  const nodesSorted = sortNodes(nodes, verticalTolerance);
  const normalizedNodes = normalizeCyNodePos(nodesSorted);
  const normalizedNodesUntouched = normalizedNodes.clone();
  const normalizedNodesWOAnnotations = normalizedNodes.filter(
    '[nodeType != "ANNOTATION"]'
  );
  const collWithNormalizedNodePos = cy.edges().union(normalizedNodes);
  // (normalizedNodes.jsons());
  cy.json(collWithNormalizedNodePos.jsons());

  console.log(cy.getElementById("bviv3cclyg").json());

  // this creates an object with the updated elements
  const roots = normalizedNodesWOAnnotations.roots();
  // const startNode = getStartNode(nodesWOAnnotations, verticalTolerance);

  // just in case, lock annotations' pos
  lockAnnotationPositions(cy);

  // console.log();
  // console.log(normalizedNodesWOAnnotations.jsons().slice(0, 2));
  // console.log();

  // console.log();
  // console.log("cy");
  // console.log(cy);
  // console.log();
  // console.log();
  // console.log("cyWOAnnotations");
  // console.log(cyWOAnnotations);
  // console.log();

  const rootsArr = roots.toArray();
  const rootsArr1 = rootsArr.slice(0, 1);

  const rows = [];
  const rowNum = 0;
  let rowStartPosX = 300;
  let currRowPosY = 160;
  let nextRowYAdd = 240;
  roots.forEach(async (ele, i, eles) => {
    // if (i === 2) {
    // rootsArr1.forEach((ele, i, eles) => {
    await animateNodesAndWait(getRowOfNodesFromRoot(ele), 5000, "green");
    getRowOfNodesFromRoot(ele).breadthFirstSearch({
      root: ele,
      visit: async (v, edge, prev, j, depth) => {
        console.log("edge"); // we're getting null here
        console.log(edge.id());
        console.log("v");
        console.log(v.id());
        if (roots.getElementById(v.id())) {
          currRowPosY += nextRowYAdd;
          v.position({ x: rowStartPosX, y: currRowPosY });
        } else {
          const prevNodePosX = prev.position("x");
          const prevNodeOg = cyBeforeRepositioning.getElementById(prev.id());
          const prevNodeOgPos = prevNodeOg.position();
          const prevNodeOgPosX = prevNodeOgPos.x;
          const prevNodeOgPosY = prevNodeOgPos.y;
          const prevNodePosY = prev.position("y");
          const currNodePosY = v.position("y");
          const nextPosX = prevNodePosX + spacing;

          v.position("x", nextPosX);

          if (v.id() === "bviv3cclyg") {
            console.log();
            console.log();
            console.log("currNodePos");
            console.log(v.id());
            console.log(v.data("nodeType"));
            console.log(v.data("name"));
            console.log(v.position());
            // console.log(v.json());

            console.log("prevNodeOgPos");
            console.log(prevNodeOg.id());
            console.log(prevNodeOg.data("nodeType"));
            console.log(prevNodeOg.position());
            console.log();
          }

          // i think the diff calc is using the updated pos of the prev node, so it's not reliable
          // calc row y pos ahead of time
          if (currNodePosY - prevNodeOgPosY > verticalTolerance) {
            console.log();
            console.log(v.id());
            console.log(prevNodeOg.id());
            console.log();
            // 240 is where the next node should start accounting for space for an annotation above it with 150 spacing to that annotation from the row above
            const numberOfRowsBelow = Math.floor(
              (currNodePosY - prevNodeOgPosY) / verticalTolerance
            );
            const nextPosY = (currRowPosY + 240) * numberOfRowsBelow;
            v.position("y", nextPosY);

            if (v.id() === "bviv3cclyg") {
              console.log("verticalTolerance");
              console.log(verticalTolerance);
              console.log("after move currNodePos");
              console.log(v.position());
              console.log();
              console.log();
            }
          } else {
            v.position("y", currRowPosY);
          }
        }
      },
      directed: true,
    });
    // }
  });

  console.log();
  console.log("old positions");
  console.log("bb45iggzc5");
  console.log(cyBeforeRepositioning.getElementById("bb45iggzc5").position());
  console.log("ze3omkafya");
  console.log(cyBeforeRepositioning.getElementById("ze3omkafya").position());
  console.log();
  console.log();
  console.log("new positions");
  console.log("bb45iggzc5");
  console.log(cy.getElementById("bb45iggzc5").position());
  console.log("ze3omkafya");
  console.log(cy.getElementById("ze3omkafya").position());
  console.log();

  console.log();
  console.log("old positions");
  console.log("bviv3cclyg");
  console.log(cyBeforeRepositioning.getElementById("bviv3cclyg").position());
  console.log("w7jmfry8oc");
  console.log(cyBeforeRepositioning.getElementById("w7jmfry8oc").position());
  console.log();
  console.log();
  console.log("new positions");
  console.log("bviv3cclyg");
  console.log(cy.getElementById("bviv3cclyg").position());
  console.log("w7jmfry8oc");
  console.log(cy.getElementById("w7jmfry8oc").position());
  console.log();

  // return await createCytoscapeGraphFromEles(
  //   cy.json(normalizedNodesWOAnnotations.jsons())
  // );
  return cy;
};

export const bfsAnimation = async (
  cy,
  spacing,
  verticalTolerance
) => {
  // const cy = createCytoscapeGraph(flowJSON);

  console.log(cy.getElementById("bviv3cclyg").json());

  const cyBeforeRepositioning = await createCytoscapeGraphFromEles(
    cy.$("*").clone().jsons()
  );
  const nodes = cy.nodes();
  const nodesOG = nodes.clone();
  const nodesSorted = sortNodes(nodes, verticalTolerance);
  const normalizedNodes = normalizeCyNodePos(nodesSorted);
  const normalizedNodesUntouched = normalizedNodes.clone();
  const normalizedNodesWOAnnotations = normalizedNodes.filter(
    '[nodeType != "ANNOTATION"]'
  );
  const collWithNormalizedNodePos = cy.edges().union(normalizedNodes);
  // (normalizedNodes.jsons());
  cy.json(collWithNormalizedNodePos.jsons());

  console.log(cy.getElementById("bviv3cclyg").json());

  const roots = normalizedNodesWOAnnotations.roots();
  // const startNode = getStartNode(nodesWOAnnotations, verticalTolerance);

  // just in case, lock annotations' pos
  lockAnnotationPositions(cy);

  // console.log();
  // console.log(normalizedNodesWOAnnotations.jsons().slice(0, 2));
  // console.log();

  // console.log();
  // console.log("cy");
  // console.log(cy);
  // console.log();
  // console.log();
  // console.log("cyWOAnnotations");
  // console.log(cyWOAnnotations);
  // console.log();

  const rootsArr = roots.toArray();
  const rootsArr1 = rootsArr.slice(0, 1);

  console.log("roots");
  console.log(roots.jsons());
  console.log("animating roots");
  const dur = 1000;
  await Promise.all(
    roots.map((ele, i, eles) => {
      return new Promise((resolve, reject) => {
        const ani = ele.animation(
          {
            style: { backgroundColor: "red" },
          },
          {
            duration: dur,
            complete: () => resolve(),
          }
        );
        ani.play();
        // await eles.pon("style");
      });
    })
  );
  console.log("animating roots completed");
  // await cy.pon("style");

  console.log("animating roots successors");
  let color = "blue";
  for (const r of roots) {
    const animatedRootSuccessors = await animateNodesAndWait(
      r.successors(),
      dur,
      color
    );
    console.log(animatedRootSuccessors);
    // animateNodes(r.successors(), dur, color);
  }

  // await cy.pon("style");
  // const rootSuccessorAnimations = roots.map((ele, i, eles) => {
  //   // return new Promise((resolve, reject) => {
  //   //   ele
  //   //     .successors()
  //   //     .filter("nodes")
  //   //     .animate(
  //   //       {
  //   //         style: { backgroundColor: "blue" },
  //   //       },
  //   //       {
  //   //         duration: 10000,
  //   //         complete: () => {
  //   //           console.log("animated " + ele.id() + "'s successors");
  //   //           resolve();
  //   //         },
  //   //       }
  //   //     );
  //   // });

  //   return animateSuccessorsOfEle(ele);
  // });

  // for (const s of rootSuccessorAnimations) {
  //   await s;
  // }

  console.log("animating roots successors completed");

  const rows = [];
  const rowNum = 0;
  let rowStartPosX = 300;
  let currRowPosY = 160;
  let nextRowYAdd = 240;

  console.log("animating row of nodes");
  for (const r of roots) {
    const rowNodes = getRowOfNodesFromRoot(r);
    const animatedNodes = await animateNodesAndWait(rowNodes, 1000, "green");
    console.log(animatedNodes);
  }
  console.log("animating row of nodes completed");

  console.log("animating row of nodes and edges");
  for (const r of roots) {
    const rowNodes = getRowOfNodesFromRoot(r);
    const row = rowNodes.union(rowNodes.connectedEdges());
    const animatedEles = await animateElesAndWait(row, 1000, "red");
    console.log(animatedEles);
  }
  console.log("animating row of nodes and edges completed");

  for (const ele of roots) {
    const currNodeAnimations = [];
    const prevNodeAnimations = [];
    const anis = [];
    getRowOfNodesFromRoot(ele).breadthFirstSearch({
      root: ele,
      visit: async (v, edge, prev, j, depth) => {
        let prevNodeAniProm;
        let prevNodeAni;
        let currNodeAniProm;
        let currNodeAni;
        if (prev) {
          const prevPos = prev.position();
          // prev.animate(
          //   {
          //     // position: prevPos,
          //     style: { backgroundColor: "green" },
          //   },
          //   {
          //     duration: dur,
          //   }
          // );
          // .delay(dur * (i + 1));
          prevNodeAniProm = new Promise((resolve, reject) => {
            prevNodeAni = prev.animation(
              {
                // position: prevPos,
                style: { backgroundColor: "green" },
              },
              {
                duration: dur,
                complete: () => resolve("animated " + v.id()),
              }
            );
          });
        }

        // await cy.pon("style");

        if (edge) {
          console.log("edge:", edge.id());
        }
        console.log("v:", v.id());
        const vPos = v.position();
        // v.animate(
        //   {
        //     // position: vPos,
        //     style: { backgroundColor: "yellow" },
        //   },
        //   {
        //     duration: dur,
        //   }
        // );
        currNodeAniProm = new Promise((resolve, reject) => {
          currNodeAni = v.animation(
            {
              // position: vPos,
              style: { backgroundColor: "yellow" },
            },
            {
              duration: dur,
              complete: () => resolve("animated " + v.id()),
            }
          );
        });

        anis.push({
          prevAniProm: prevNodeAniProm,
          prevAni: prevNodeAni,
          currAni: currNodeAni,
          currAniProm: currNodeAniProm,
        });

        // await cy.pon("style");
        if (roots.getElementById(v.id())) {
          // currRowPosY += nextRowYAdd;
          // v.position({ x: rowStartPosX, y: currRowPosY });
        } else {
          const prevNodePosX = prev.position("x");
          const prevNodeOg = cyBeforeRepositioning.getElementById(prev.id());
          const prevNodeOgPos = prevNodeOg.position();
          const prevNodeOgPosX = prevNodeOgPos.x;
          const prevNodeOgPosY = prevNodeOgPos.y;
          const prevNodePosY = prev.position("y");
          const currNodePosY = v.position("y");
          const nextPosX = prevNodePosX + spacing;
          //
          // v.position("x", nextPosX);
          //
          if (v.id() === "bviv3cclyg") {
            console.log();
            console.log();
            console.log(
              "currNodePos:",
              v.id(),
              v.data("nodeType"),
              v.data("name"),
              v.position()
            );
            // console.log(v.json());

            console.log(
              "prevNodeOgPos:",
              prevNodeOg.id(),
              prevNodeOg.data("nodeType"),
              prevNodeOg.position()
            );
            console.log();
          }

          // i think the diff calc is using the updated pos of the prev node, so it's not reliable
          // calc row y pos ahead of time
          if (currNodePosY - prevNodeOgPosY > verticalTolerance) {
            console.log();
            console.log(v.id());
            console.log(prevNodeOg.id());
            console.log();
            // 240 is where the next node should start accounting for space for an annotation above it with 150 spacing to that annotation from the row above
            // const numberOfRowsBelow = Math.floor(
            //   (currNodePosY - prevNodeOgPosY) / verticalTolerance
            // );
            // const nextPosY = (currRowPosY + 240) * numberOfRowsBelow;
            // // v.position("y", nextPosY);
            // //
            if (v.id() === "bviv3cclyg") {
              console.log("verticalTolerance:", verticalTolerance);
              console.log("after move currNodePos:", v.position());
              console.log();
              console.log();
            }
          } else {
            // v.position("y", currRowPosY);
          }
        }
      },
      directed: true,
    });

    for (const a of anis) {
      console.log(a);
      const { prevAniProm, prevAni, currAni, currAniProm } = a;
      if (prevAniProm && prevAni) {
        prevAni.play();
        const prevAnimated = await prevAniProm;
        console.log(prevAnimated);
      }
      currAni.play();
      const currAnimated = await currAniProm;
      console.log(currAnimated);
    }
    // }
  }

  console.log();
  console.log("old positions");
  console.log("bb45iggzc5");
  console.log(cyBeforeRepositioning.getElementById("bb45iggzc5").position());
  console.log("ze3omkafya");
  console.log(cyBeforeRepositioning.getElementById("ze3omkafya").position());
  console.log();
  console.log();
  console.log("new positions");
  console.log("bb45iggzc5");
  console.log(cy.getElementById("bb45iggzc5").position());
  console.log("ze3omkafya");
  console.log(cy.getElementById("ze3omkafya").position());
  console.log();

  console.log();
  console.log("old positions");
  console.log("bviv3cclyg");
  console.log(cyBeforeRepositioning.getElementById("bviv3cclyg").position());
  console.log("w7jmfry8oc");
  console.log(cyBeforeRepositioning.getElementById("w7jmfry8oc").position());
  console.log();
  console.log();
  console.log("new positions");
  console.log("bviv3cclyg");
  console.log(cy.getElementById("bviv3cclyg").position());
  console.log("w7jmfry8oc");
  console.log(cy.getElementById("w7jmfry8oc").position());
  console.log();

  // return await createCytoscapeGraphFromEles(
  //   cy.json(normalizedNodesWOAnnotations.jsons())
  // );
  return cy;
};

/**
 * Has to be run on a cy instance *NOT* in headless mode
 *
 * @param {*} outputFilePath
 * @param {*} cy
 */
export const exportPNG = (outputFilePath, cy) => {
  const options = {
    output: "base64uri",
    full: true,
    maxWidth: 1920,
    maxHeight: 1080,
  };
};

export const getCyJSON = (cy) => {
  try {
    return cy.json(false);
  } catch (e) {
    throw new Error("Could not convert graph to json.", { cause: e });
  }
};

export const getFlowJSON = (ogFlowJSON, cy) => {
  const cyJSON = getCyJSON(cy);
  ogFlowJSON.graphData.elements.nodes = cyJSON.elements.nodes;
  ogFlowJSON.graphData.elements.edges = cyJSON.elements.edges;
  ogFlowJSON.enabledGraphData.elements.nodes = cyJSON.elements.nodes;
  ogFlowJSON.enabledGraphData.elements.edges = cyJSON.elements.edges;
  return ogFlowJSON;
};

// export const writeFlowJSON = (outputFilePath, ogFlowJSON, cy) => {
//   writeFileSync(outputFilePath, getFlowJSON(ogFlowJSON, cy));
// };
