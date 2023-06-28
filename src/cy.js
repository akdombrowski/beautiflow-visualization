import cytoscape from "cytoscape";

export const convertStrToJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    throw new SyntaxError("Content needs to be of JSON", { cause: e });
  }
};

export const readFlowJSONFile = async (filename) => {
  console.log("Reading flow json from file... ", filename);
  if (!filename.endsWith(".json")) {
    const errMsg = "Must use a JSON file (filename ends with .json).";
    console.error(errMsg);
    throw new Error(errMsg);
  }

  let data = await readFileSync(filename, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      throw new Error("Couldn't read file contents", { cause: err });
    }

    return data;
  });

  const flowJSON = convertStrToJSON(data);

  return flowJSON;
};

export const readFlowJSONFileWithFileReader = async (filename) => {
  console.log("Reading flow json from file...", filename);
  if (!filename.endsWith(".json")) {
    const errorMessage = "Must use a JSON file (filename ends with .json).";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const blob = new Blob([]);
  const reader = new FileReader();
  const data = new File(blob, filename, {
    type: "text/plain",
  });
  reader.addEventListener("load", (evt) => {
    const flowJSON = convertStrToJSON(text);
    return flowJSON;
  });

  const text = reader.readAsText(data);
};

export const getGraphData = (flowJSON) => {
  try {
    return flowJSON.graphData;
  } catch (error) {
    throw new Error("Could not extract the graph data", { cause: error });
  }
};

export const createElementsObjFromArrays = (nodesArray, edgesArray) => ({
  nodes: nodesArray,
  edges: edgesArray,
});

export const getElements = (flowJSON) => {
  try {
    return getGraphData(flowJSON).elements;
  } catch (e) {
    throw new Error(
      "Could not extract elements. Something isn't right with fetching the graphData.",
      { cause: e }
    );
  }
};

export const getNodes = (flowJSON) => {
  try {
    return getElements(flowJSON).nodes;
  } catch (e) {
    throw new Error("Could not extract the nodes.", { cause: e });
  }
};

export const getEdges = (flowJSON) => {
  try {
    return getElements(flowJSON).edges;
  } catch (e) {
    throw new Error("Could not extract the edges.", { cause: e });
  }
};

export const getCopyOfElementsObj = (flowJSON) => {
  try {
    const elementsCopy = JSON.parse(JSON.stringify(getElements(flowJSON)));
    return elementsCopy;
  } catch (e) {
    throw new Error("Could not get a copy of the elements.", { cause: e });
  }
};

export const getCopyOfNodesArr = (flowJSON) => {
  try {
    return getNodes(flowJSON).slice(0);
  } catch (e) {
    throw new Error("Could not get the nodes to make a copy.", { cause: e });
  }
};

export const getCopyOfEdgesArr = (flowJSON) => {
  try {
    return getEdges(flowJSON).slice(0);
  } catch (e) {
    throw new Error("Could not get the edges to make a copy.", { cause: e });
  }
};

export const getCopyOfAnnotationsArr = (flowJSON) => {
  try {
    const nodes = getNodes(flowJSON);
    return Array.filter(nodes, (n, i, nodes) => {
      return n.data.nodeType === "ANNOTATION";
    });
  } catch (e) {
    throw new Error("Could not extract the annotations.", { cause: e });
  }
};

export const getCopyOfNodesArrWOAnnotations = (flowJSON) => {
  try {
    const nodes = getNodes(flowJSON);
    return Array.filter(nodes, (n, i, nodes) => {
      return n.data.nodeType !== "ANNOTATION";
    });
  } catch (e) {
    throw new Error("Could not get a copy of the nodes without annotations.", {
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
    throw new Error("Could not get a copy of the nodes without annotations.", {
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
    throw new Error(
      "Could not get a copy of the elements without annotations.",
      {
        cause: e,
      }
    );
  }
};

export const convertToBasicCyNodesArr = (nodes) => {
  const cyNodes = [];

  for (const n of nodes) {
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

  for (const e of edges) {
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
    elements,
    layout: "preset",
    headless: true,
    styleEnabled: false,
  });

  return cy;
};

export const createPosMapping = (flowJSON) => {
  const nodes = getCopyOfNodesArr(flowJSON);
  const posMapping = new Map();

  for (const n of nodes) {
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

    // console.log(elementsCopy.jsons());

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
      elements: elements,
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
  nodesArray,
  edgesArray
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

  for (const n of nodes) {
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

  for (const n of nodes) {
    const y = n.position.y;
    if (y < minY) {
      minYNode = n;
      minY = y;
    }
  }

  return minYNode;
};

export const getMinXCyNode = (cyNodes) => {
  const minXCyNode = cyNodes.min((ele, i, eles) => ele.position("x")).ele;

  return minXCyNode;
};

export const getMinYCyNode = (cyNodes) => {
  const minYCyNode = cyNodes.min((ele, i, eles) => ele.position("y")).ele;

  return minYCyNode;
};

export const getMinXCyNodePos = (cyNodes) => {
  const minXCyNodePos = getMinXCyNode(cyNodes).position("x");

  return minXCyNodePos;
};

export const getMinYCyNodePos = (cyNodes) => {
  const minYCyNodePos = getMinYCyNode(cyNodes).position("y");

  return minYCyNodePos;
};

export const getMaxXCyNode = (cyNodes) => {
  const minXCyNode = cyNodes.max((ele, i, eles) => ele.position("x")).ele;

  return minXCyNode;
};

export const getMaxYCyNode = (cyNodes) => {
  const minYCyNode = cyNodes.max((ele, i, eles) => ele.position("y")).ele;

  return minYCyNode;
};

export const getMaxXCyNodePos = (cyNodes) => {
  const maxXCyNodePos = getMaxXCyNode(cyNodes).position("x");

  return maxXCyNodePos;
};

export const getMaxYCyNodePos = (cyNodes) => {
  const maxYCyNodePos = getMaxYCyNode(cyNodes).position("y");

  return maxYCyNodePos;
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

export const shiftAnnosRenderedPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');

  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width.value;
    const newPosX = posX + width / 2;
    ele.renderedPosition("x", newPosX);
  });

  return nodes;
};

export const shiftAnnosPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');

  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width
      ? ele.data("properties").width.value
      : 300;
    const newPosX = posX + width / 2;
    ele.position("x", newPosX);
  });

  return nodes;
};

export const resetAnnosPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');
  annies.unlock();
  annies.positions((ele, i) => {
    const posX = ele.position("x");
    const width = ele.width() || 300;
    const newPosX = posX - width / 2;
    const newPosY = ele.position("y");
    return { x: newPosX, y: newPosY };
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
  const minY = cyNodes.min((ele, i, eles) => ele.position("y"));
  const minYPos = minY.value;
  const firstRowCyNodes = getCyNodesInRowAtYPos(cyNodes, minYPos, tolerance);
  const minX = Number.POSITIVE_INFINITY;
  const startCyNode = firstRowCyNodes.min((ele, i, eles) =>
    ele.position("x")
  ).ele;

  return startCyNode;
};

export const normalizeNodePositions = (nodes) => {
  const nodesCopy = nodes.slice(0);
  const minX = getMinXNode(nodesCopy).position.x;
  const minY = getMinYNode(nodesCopy).position.y;

  for (const n of nodesCopy) {
    n.position.x -= minX;
    n.position.y -= minY;
  }

  return nodesCopy;
};

export const normalizeCyNodePos = (nodes) => {
  const minX = getMinXCyNode(nodes.filter('[nodeType != "ANNOTATION"]'));
  const minXPos = minX.position("x");
  const minY = getMinYCyNode(nodes);
  const minYPos = minY.position("y");
  const xShift = -1 * minXPos;
  const yShift = -1 * minYPos;

  nodes.shift({ x: xShift, y: yShift });

  return { nodes, shift: { xShift, yShift } };
};

export const lockAnnotationPositions = (cy) => {
  cy.nodes('[nodeType = "ANNOTATION"]').lock();
};

export const unlockAnnotationPositions = (cy) => {
  cy.nodes('[nodeType = "ANNOTATION"]').unlock();
};

export const spaceHorizontallyUsingCyGridLayout = (
  flowJSON,
  spacing,
  verticalTolerance
) => {
  const cy = createCytoscapeGraph(flowJSON);
  const options = {
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

export const sortNodesAnnosFirst = (nodes, verticalTolerance) => {
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

export const sortRoots = (roots, verticalTolerance) => {
  const rootsSorted = roots.sort((ele1, ele2) => {
    const ele1X = ele1.position("x");
    const ele1Y = ele1.position("y");
    const ele2X = ele2.position("x");
    const ele2Y = ele2.position("y");

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

  return rootsSorted;
};

export const getSourceNode = (cy, targetNodeID) => {
  const sourceNode = cy.$("#" + targetNodeID).incomers("node");
  return sourceNode;
};

export const animateSuccessorsOfEle = (ele, dur, color) => {
  const anis = ele
    .successors()
    .filter("node")
    .map((el, i, els) => {
      const ani = el.animation(
        {
          style: { backgroundColor: color },
        },
        {
          duration: dur,
          complete: () => console.log("animated " + ele.id() + "'s successors"),
        }
      );
    });

  return anis;
};

export const emitStyleEventForExplainerText = (
  cy,
  ani,
  aniDes,
  start,
  end,
  debugAnimations
) => {
  if (debugAnimations) {
    if (start) {
      console.log(ani, aniDes);
    } else if (end) {
      console.log(ani, aniDes, "completed");
    }
  }

  cy.emit("style", [ani, aniDes, start, end]);
};

export const animateNodesAndWait = async (cy, nodes, dur, color) => {
  return Promise.all(
    nodes.map((ele, i, eles) => {
      const msg = "animated " + ele.id();
      return new Promise((resolve, reject) => {
        const ani = ele.animation(
          {
            style: { backgroundColor: color },
          },
          {
            duration: dur,
            easing: "ease-out-quart",
            complete: () => {
              // console.log("animated " + ele.id());
              emitStyleEventForExplainerText(cy, "", msg, false, true);
              resolve(msg);
            },
          }
        );
        emitStyleEventForExplainerText(cy, "", msg, true, false);
        ani.play();
      });
    })
  );
};

export const animateElesAndWait = async (cy, els, dur, color) => {
  return Promise.all(
    els.map((ele, i, eles) => {
      const msg = "animated " + ele.id();
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
            easing: "ease-out-quart",
            complete: () => {
              // console.log("animated " + ele.id());
              emitStyleEventForExplainerText(cy, "", msg, false, true);
              resolve(msg);
            },
          }
        );
        emitStyleEventForExplainerText(cy, "", msg, true, false);
        ani.play();
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
        easing: "ease-out-quart",
        complete: () => {
          // console.log(ele.id() + " animated");
          return;
        },
      }
    );
    ani.play();
  });
};

export const getAnimationPromiseForEle = (ele, dur, color) => {
  let ani;
  const prom = new Promise((resolve, reject) => {
    ani = ele.animation(
      {
        style: { backgroundColor: color },
      },
      {
        duration: dur,
        easing: "ease-out-quart",
        complete: () => {
          // console.log(ele.id() + " animated");
          resolve("animated " + ele.id());
        },
      }
    );
  });
  return { ani, prom };
};

export const animateElePosAndPlay = (cy, ele, dur, color, pos) => {
  const msg = "animated " + ele.id();
  return new Promise((resolve, reject) => {
    const ani = ele.animation(
      {
        position: pos,
      },
      {
        duration: dur,
        easing: "ease-out-quart",
        complete: () => {
          // console.log(ele.id() + " animated");
          emitStyleEventForExplainerText(cy, "", msg, false, true);
          resolve(msg);
        },
      }
    );
    emitStyleEventForExplainerText(cy, "", msg, true, false);
    ani.play();
  });
};

export const emitAndWaitForAni = async (msg, id, cy, ani, aniProm) => {
  emitStyleEventForExplainerText(cy, "", msg, true, false);
  ani.play();
  const animated = await aniProm;
  emitStyleEventForExplainerText(cy, "", msg, false, true);
  return animated;
};

export const playNodeAnimationsOneByOne = async (
  cy,
  animations,
  dur,
  spacing
) => {
  // Emits an event that we can watch for in the main app UI to update the text
  // of the animation description box
  emitStyleEventForExplainerText(cy, "Beautiflowifying", "", true, false);

  for (const ani of animations) {
    const {
      currIDDone,
      prevIDDone,
      nodesInCurrRowSection,
      rootID,
      rootColorAni,
      rootColorAniProm,
      rootAni,
      rootAniProm,
      newRootPos,
      vColorAni,
      vColorAniProm,
      vMovePos,
      vMoveAni,
      vMoveAniProm,
      currID,
    } = ani;
    let msg;

    if (rootColorAni) {
      msg = "coloring root " + rootID;
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        rootID,
        cy,
        rootColorAni,
        rootColorAniProm
      );
    }

    if (rootAni) {
      msg = "animating root " + rootID;
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        rootID,
        cy,
        rootAni,
        rootAniProm
      );
    }

    if (vColorAni) {
      msg = "coloring current node" + currID;
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        currID,
        cy,
        vColorAni,
        vColorAniProm
      );
    }

    if (vMovePos) {
      msg = "animating " + ani.currID + " to " + JSON.stringify(vMovePos);
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        currID,
        cy,
        vMoveAni,
        vMoveAniProm
      );
    }

    // Change prev node to green as its processing is complete
    if (prevIDDone) {
      msg = "curr node " + prevIDDone + " processing is complete animation";
      const { ani: doneWithPrevNodeAni, prom } = getAnimationPromiseForEle(
        cy.$("#" + prevIDDone),
        dur,
        "green"
      );
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        prevIDDone,
        cy,
        doneWithPrevNodeAni,
        prom
      );
    }

    // Change prev node to green as its processing is complete
    if (currIDDone) {
      msg = "curr node " + currIDDone + " processing is complete animation";
      const { ani: doneWithPrevNodeAni, prom } = getAnimationPromiseForEle(
        cy.$("#" + currIDDone),
        dur,
        "green"
      );
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        currIDDone,
        cy,
        doneWithPrevNodeAni,
        prom
      );
    }

    // If the current node is a leaf node, we're done processing it. Change
    // its color to green as well.
    if (
      !cy
        .$("#" + currID)
        .outgoers()
        .size()
    ) {
      msg = "prev node " + currID + " processing is finished animation";
      const { ani: doneWithCurrLeafNodeAni, prom } = getAnimationPromiseForEle(
        cy.$("#" + currID),
        dur,
        "green"
      );
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        currID,
        cy,
        doneWithCurrLeafNodeAni,
        prom
      );
    }
  }
  emitStyleEventForExplainerText(cy, "Beautiflowifying", "", false, true);
};

export const getRowOfNodesFromRoot = (root) => {
  const row = root.successors();
  return row.union(root);
};

export const doesNodePathMergeWithAlreadyVisitedNodes = (
  vSuccessors,
  v,
  spacing,
  visitedNodes
) => {
  const vSuccessorsPredecessors = vSuccessors.predecessors("node");
  // Get the already visited elements up to the point where v's path
  // hits an already visited node
  // this should give the eles which should be above the current node
  const visitedElesBeforePathMerge = vSuccessorsPredecessors.not(
    vSuccessors.union(v)
  );

  const removeUnvisitedNodes =
    visitedElesBeforePathMerge.intersection(visitedNodes);

  const { value, ele } = removeUnvisitedNodes.max((ele, i, eles) => {
    return ele.position("y");
  });

  const posY = value + spacing;

  return posY;
};

export const getAllAnnotations = (cy) => {
  const annies = cy.filter('[nodeType = "ANNOTATION"]');

  return annies;
};

export const getAnniesByColor = (cy, color) => {
  const annies = getAllAnnotations(cy);
  const anniesColor = [];

  annies.forEach((ele, i, eles) => {
    const bgColor = ele.data().properties?.backgroundColor?.value;
    if (bgColor && bgColor === color) {
      annies.push(ele);
    }
  });

  return anniesColor;
};

export const getSectionTitleAnnies = (cy, annieColor) => {
  const color = annieColor || "#5D00D6";
  const sectionTitleAnnies = getAnniesByColor(cy, color);

  return sectionTitleAnnies;
};

export const getTitleAnnies = (cy) => {
  const color = annieColor || "#4462ed";
  const sectionTitleAnnies = getAnniesByColor(cy, color);

  return sectionTitleAnnies;
};

export const getNodeNearestAnnotation = (nodes, annie, maxSearchRange) => {
  return nodes[0];
};

export const isAnnieWithinRangeOfNode = (node, annie, range, direction) => {
  const nodePosX = node.position("x");
  const nodePosY = node.position("y");
  const anniePosX = annie.position("x");
  const anniePosY = annie.position("y");
  const isWithinRangeX = Math.abs(nodePosX - anniePosX) <= range;
  const isWithinRangeY = Math.abs(nodePosY - anniePosY) <= range;

  if ("x" === direction) {
    return isWithinRangeX;
  }

  if ("y" === direction) {
    return isWithinRangeY;
  }

  return isWithinRangeX && isWithinRangeY;
};

export const isAnnieWithinRangeAboveNode = (node, annie, range) => {
  const nodePosX = node.position("x");
  const nodePosY = node.position("y");
  const anniePosX = annie.position("x");
  const anniePosY = annie.position("y");
  const isWithinRangeAbove =
    anniePosY >= nodePosY && anniePosY - nodePosY <= range;

  return isWithinRangeAbove;
};

export const isAnnieWithinRangeLeftOfNode = (node, annie, range) => {
  const nodePosX = node.position("x");
  const anniePosX = annie.position("x");
  const isWithinRangeToLeft =
    anniePosX <= nodePosX && nodePosX - anniePosX <= range;

  return isWithinRangeToLeft;
};

export const isAnnieWithinRangeRightOfNode = (node, annie, range) => {
  const nodePosX = node.position("x");
  const anniePosX = annie.position("x");
  const isWithinRangeToLeft =
    anniePosX >= nodePosX && anniePosX - nodePosX <= range;

  return isWithinRangeToLeft;
};

export const getAnnieClosestToNode = (
  cy,
  node,
  allowableDisX,
  maxSearchRangeY
) => {
  const nodePosX = node.position("x");
  const nodePosY = node.position("y");
  const annies = getAllAnnotations(cy);
  let closest;
  let minDisY = Math.POSITIVE_INFINITY;

  annies.forEach((ele, i, eles) => {
    const anniePosX = ele.position("x");
    const anniePosY = ele.position("y");
    const disX = Math.abs(anniePosX - nodePosX);
    const disY = Math.abs(anniePosY - nodePosY);
    const checkXY = allowableDisX && maxSearchRangeY;
    if (checkXY) {
      const isAnnieWithinRangeOfNode = isAnnieWithinRangeOfNode(
        node,
        annie,
        maxSearchRangeY
      );
      if (isAnnieWithinRangeOfNode && disX <= allowableDisX) {
        if (disY < minDisY) {
          closest = ele;
          minDisY = disY;
        }
      }
    }
  });

  return closest;
};

export const handleAnnos = async (cy, shiftValX, shiftValY) => {
  unlockAnnotationPositions(cy);

  const nodesAfterFormatWOAnnos = cy.nodes('[nodeType != "ANNOTATION"]');
  const annos = cy.nodes('[nodeType = "ANNOTATION"]');
  const maxXPos = getMaxXCyNodePos(nodesAfterFormatWOAnnos);
  const maxYPos = getMaxYCyNodePos(nodesAfterFormatWOAnnos);
  const buffX = shiftValX || 600;
  const buffY = shiftValY || 0;
  const sortedAnnos = sortNodes(annos);
  const annosMinX = getMinXCyNodePos(sortedAnnos);
  const annosMinY = getMinYCyNodePos(sortedAnnos);
  const shiftValueX = buffX ? maxXPos - annosMinX + buffX : 0;
  const shiftValueY = buffY ? maxYPos - annosMinY + buffY : 0;

  annos.shift({ x: shiftValueX, y: shiftValueY });

  return annos;
};

export const beautiflowify = async ({
  cy,
  xSpacing,
  ySpacing,
  verticalTolerance,
  durMillis,
  isInstant,
  annotations,
}) => {
  const cyBeforeRepositioning = await createCytoscapeGraphFromEles(
    cy.$("*").clone().jsons()
  );

  // Get the nodes in the flow/graph
  const nodes = cy.nodes();
  // Make a backup. Just in case.
  const nodesOG = nodes.clone();

  // Sorts nodes top to bottom and left to right
  const nodesSorted = sortNodesAnnosFirst(nodes, verticalTolerance);
  // Set origin point
  const { nodes: normalizedNodes, shift: normalizationShift } =
    normalizeCyNodePos(nodesSorted);
  const normalizedNodesUntouched = normalizedNodes.clone();
  const normalizedNodesWOAnnotations = normalizedNodes.filter(
    '[nodeType != "ANNOTATION"]'
  );

  const collWithNormalizedNodePos = cy.edges().union(normalizedNodes);
  cy.json(collWithNormalizedNodePos.jsons());

  const roots = normalizedNodesWOAnnotations.roots();
  const rootsSorted = sortRoots(roots, verticalTolerance);
  // cy.fit(getRowOfNodesFromRoot(rootsSorted.first()), 150);

  // Just in case, lock annotations' pos
  lockAnnotationPositions(cy);

  const visitedNodes = cy.collection();
  // keep track of new pos of nodes in case animations are saved for after
  // calculations
  const updatedPos = {};
  // start rows at pos.x = 0
  const rowStartPosX = 0;
  // the y value for the starting row
  const firstRowStartPosY = 180;
  // the xSpacing for nodes in the same row-section, aka when a row has multiple
  // vertical levels
  const sameRowDiffHeightSpacingY = ySpacing;
  // before calculations, the y value for nodes in top level of each row
  const sectionBaselinePosY = [];
  // xSpacing between row sections
  const rowSpacingY = ySpacing + 60;
  // the y pos value of the visually lowest node (highest y pos value)
  const highestYPosValueInSection = [];
  // fit whole graph (minus annotations before beginning)
  cy.fit(cy.nodes().filter("[nodeType != 'ANNOTATION']"));
  // iterate over the roots
  for (let row = 0; row < rootsSorted.length; row++) {
    // a root element (there could be multiple roots for a single row-section)
    // for the current row-section
    const ele = rootsSorted[row];
    // holder for animations in case animations are played after calculations
    const animations = [];
    // collection of successor nodes from the current root
    const nodesInCurrRow = getRowOfNodesFromRoot(ele);
    // clone of current root successor nodes
    const nodesInCurrRowClone = nodesInCurrRow.clone();
    /**
     * sectionBasePosY is the y-value for the starting nodes and any following
     * nodes along that same horizontal line
     *
     * if row > 0,
     * take the lowest y value of the previous section and add our row xSpacing
     *  to it
     * else,
     * use the first row y pos (firstRowStartPosY)
     *
     * */
    sectionBaselinePosY[row] = row
      ? highestYPosValueInSection[row - 1] + rowSpacingY
      : firstRowStartPosY;
    // Init highest (lowest on screen visually) y-value for this new section to
    // be at this section's row height
    highestYPosValueInSection[row] = sectionBaselinePosY[row];

    /**
     * Use BFS to iterate over current root's successor nodes
     *
     * runs @see {@link Cytoscape#breadthFirstSearch} on nodes in the same
     * section as the current iterated root node
     */

    nodesInCurrRow.breadthFirstSearch({
      root: ele,
      visit: async (v, edge, prev, j, depth) => {
        // holder for current visited node's animations and related info
        const currStepAnimations = {};
        // current visited node's id
        const vID = v.id();
        // current visited node's position
        const vPos = v.position();
        // updated pos holder for the current visited node
        const pos = {};
        // variables for prev node's (source node's) animation and the promise
        // containing that animation
        let prevNodeAniProm;
        let prevNodeAni;

        // Skip if we've already visited this node
        if (!visitedNodes.anySame(v)) {
          currStepAnimations.currID = vID;
          const vSuccessors = v.successors();

          /**
           * Decide new position based on whether if it's a root node or not
           *
           * Root nodes
           *  go to start of row's y pos, x pos should be 0
           *
           * Non-root nodes
           *  x pos will depend on how deep into bfs we are
           *  y pos depends on whether it's in a column with other nodes connected
           *    to the same source node
           */
          if (rootsSorted.getElementById(vID).length > 0) {
            // At a root node
            currStepAnimations.nodesInCurrRowSection = nodesInCurrRow;

            /**
             * Check if this root's path leads into already visited nodes
             * in other words, check if any of the root's successors have
             * already been visited
             */
            if (vSuccessors.anySame(visitedNodes)) {
              // This root contains a path that leads into nodes we've already
              // visited, aka this row-section contains multiple roots

              // Calculate the y pos based on already visited nodes
              pos.y = doesNodePathMergeWithAlreadyVisitedNodes(
                vSuccessors,
                v,
                sameRowDiffHeightSpacingY,
                visitedNodes
              );

              // Get the eles already visited and is a successor of the current
              // node and the current node itself and find the max y position
              // value out of them
              //
              // e.g.,
              // suppose our graph looks like below
              // A - B - C - D - E - F
              //       /
              // G - H - I - J
              // ^
              // and suppose that we've already visited the first row (A
              // through F)
              // and the current node is G (a root)
              //
              // G's successors will be:
              // H, I, J, C, D, E, F
              const maxOfRow = visitedNodes.max(
                (ele, i, eles) => updatedPos[ele.id()].y
              );

              // the visually lowest node's y pos value, or the highest y pos
              // value for this row will be the greater of the current node's
              // new y pos value or there's an already visited node that has a
              // greater y pos value (is visually lower)
              highestYPosValueInSection[row] = Math.max(pos.y, maxOfRow.value);

              /**
               *
               * Calculate new x pos
               *
               */
              // e.g.,
              // a root that edges into the end of the row of nodes above it

              // find the first already visited node that this row merges into
              // count the number of unvisited nodes up to that point
              // unvisited nodes up to that point will be that first already
              // visited nodes unvisited predecessors that are in this row
              // multiply that count by the horizontal xSpacing
              // that should be this root's x pos
              const visitedVSuccessors = visitedNodes.intersection(vSuccessors);
              const visitedVSuccessorsSortedX = visitedVSuccessors.sort(
                (ele1, ele2) => {
                  // a negative value means ele1 will be placed before ele2
                  // this will return a neg value if ele2's updated x pos value
                  // is greater than ele1's
                  return updatedPos[ele1.id()].x - updatedPos[ele2.id()].x;
                }
              );
              const firstVisitedVSuccessor = visitedVSuccessorsSortedX.first();
              const firstVisitedVSuccessorPredecessors =
                firstVisitedVSuccessor.predecessors("node");
              const currRowNodesLeadingIntoFirstVisitedVSuccessor =
                nodesInCurrRow.intersection(firstVisitedVSuccessorPredecessors);
              const count =
                currRowNodesLeadingIntoFirstVisitedVSuccessor.size();
              const xDisFromRootNewPosToFirstVisitedVSuccessor =
                count * xSpacing;
              const firstVisitedVSuccessorPosX =
                firstVisitedVSuccessor.position("x");
              const rootNewPosX =
                firstVisitedVSuccessorPosX -
                xDisFromRootNewPosToFirstVisitedVSuccessor;
              pos.x = rootNewPosX;
            } else {
              // the currently visited node and its successors do not overlap
              // with any already visited nodes
              pos.y = sectionBaselinePosY[row];

              // it's a root node that does not lead into already visited nodes
              // start at the horizontal beginning
              pos.x = rowStartPosX;

              // update greatest y pos value of this row if the current node's
              // new y pos is greater than any already visited node's
              highestYPosValueInSection[row] = Math.max(
                highestYPosValueInSection[row],
                pos.y
              );
            }
            /**
             *
             */

            let rootColorAni;
            let rootColorAniProm;
            let rootAni;
            let rootAniProm;
            if (isInstant) {
              v.position(pos);
            } else {
              /**
               * =====================
               *  Root Node Animation
               * =====================
               *
               * color - white
               *  and
               * new position
               *
               */
              rootColorAniProm = new Promise((resolve, reject) => {
                rootColorAni = v.animation(
                  {
                    style: { backgroundColor: "brown" },
                  },
                  {
                    duration: durMillis / 2,
                    easing: "ease-out-quart",
                    complete: () => {
                      resolve("animating root " + vID);
                    },
                  }
                );
              });

              rootAniProm = new Promise((resolve, reject) => {
                rootAni = v.animation(
                  {
                    position: pos,
                  },
                  {
                    duration: durMillis,
                    complete: () => {
                      resolve("animating root " + vID);
                    },
                  }
                );
              });
            }

            updatedPos[vID] = pos;

            if (!isInstant) {
              currStepAnimations.rootID = vID;
              currStepAnimations.currID = vID;
              currStepAnimations.currIDDone = vID;
              currStepAnimations.rootColorAni = rootColorAni;
              currStepAnimations.rootColorAniProm = rootColorAniProm;
              currStepAnimations.rootAniProm = rootAniProm;
              currStepAnimations.rootAni = rootAni;
              currStepAnimations.newRootPos = pos;
              animations.push(currStepAnimations);
            }
            // else {
            //   v.delayAnimation(row * 10 + durMillis + 15);
            //   rootAni.play();
            // }
            /**
             *
             *
             *
             */
          } else if (prev) {
            const prevID = prev.id();
            const prevPosX = prev.position("x");
            const prevPosY = prev.position("y");
            const prevOG = cyBeforeRepositioning.getElementById(prevID);
            const prevOGPos = prevOG.position();
            const prevOGPosX = prevOGPos.x;
            const prevOGPosY = prevOGPos.y;
            const prevNewPosX = updatedPos[prevID].x;
            const prevNewPosY = updatedPos[prevID].y;
            const prevOutgoerNodes = prev.outgoers("node");
            // New x pos variable
            const posX = xSpacing + prevNewPosX;

            if (!isInstant) {
              const prevOutgoersUnvisited =
                prevOutgoerNodes.difference(visitedNodes);
              const isPrevProcessingComplete = prevOutgoersUnvisited.size() > 1;
              const vOutgoers = v.outgoers("node");
              const vOutgoersUnvisitied = vOutgoers.difference(visitedNodes);
              const isVProcessingComplete = vOutgoersUnvisitied.size() > 1;
              currStepAnimations.prevIDDone = isPrevProcessingComplete
                ? null
                : prevID;
              currStepAnimations.currIDDone = isVProcessingComplete
                ? null
                : vID;
            }
            /**
             *
             */

            /**
             *
             *
             * Calculate and move current node to new position
             *
             *
             */

            /**
             *
             * ================
             *  New x position
             * ================
             *
             */
            pos.x = posX;
            /**
             *
             */

            /**
             *
             * ================
             *  New y position
             * ================
             *
             */
            /**
             * Check if this node is in a stack by seeing if the previous
             * (source) node has more than 1 outgoer
             *
             * if it does, sort the previous node's outgoers by y value (from
             * lowest value to highest value)
             * then, the index of where the current node is found of that
             * sorted array of outgoers will be the level at which to place the
             * current node. with 0 being at the same baseline row height, and
             * higher values being successively visually lower rows
             *
             * if it doesn't, set new y pos value to be at the same y pos value
             * as its prev (source) node
             */

            /**
             * Accounting for a row with multiple roots
             */
            //
            // ex:
            // suppose our graph looks like below
            // A - B - C - D - E - F
            //       /
            // G - H - I - J
            //         ^
            // and suppose that we've already visited the first row (A
            // through F)
            // and we've already visited G
            // and the current node is I
            //
            //
            if (prevOutgoerNodes.size() > 1) {
              // sort from highest to lowest visually or, in other words, from smallest y pos value to largest y pos value
              const allOutgoersSorted = prevOutgoerNodes.sort((ele1, ele2) => {
                // const ele1PosY = updatedPos[ele1.id()]
                //   ? updatedPos[ele1.id()].y
                //   : ele1.position("y");
                // const ele2PosY = updatedPos[ele2.id()]
                //   ? updatedPos[ele2.id()].y
                //   : ele2.position("y");
                const ele1PosY = ele1.position("y");
                const ele2PosY = ele2.position("y");
                return ele1PosY - ele2PosY;
              });
              const allOutgoersSortedArr = allOutgoersSorted.toArray();

              // of the previous node's outgoers
              // find which nodes have already been visited,
              // find the max y value out of those nodes,
              // then add same row vertical xSpacing
              //
              // preserving vertical order:
              // A - B
              //  \\
              //   \ C
              //     D
              //
              // B, C, D are outgoers of A
              //
              // imagine after A is processed C gets picked as the next node to
              // process
              //
              // either try figuring out how to make sure B is chosen as the
              // next node to process
              // or let C be chosen as next and calc where B would go when it
              // gets processed and calc C's pos off of that
              //
              // what if we have a graph that looks like this
              //
              // A - B - C
              //   /
              // D - E
              //   \ ^
              //     F
              //
              // We've already visited A-D and are now on E
              //
              //
              const visitedNodesClone = visitedNodes.clone();
              const i = allOutgoersSortedArr.indexOf(v);
              const prevOutgoerNodesAboveV = allOutgoersSorted.slice(0, i);

              if (prevOutgoerNodesAboveV.size() > 0) {
                let startY = prevNewPosY;
                const visited =
                  prevOutgoerNodesAboveV.intersection(visitedNodes);
                const unvisited = prevOutgoerNodesAboveV.difference(visited);
                const numVisited = visited.size();
                const numUnvisited = unvisited.size();
                // need to sort by y again or is the order preserved?
                if (numVisited > 0) {
                  const visitedMaxY = visited.max((ele, i, eles) => {
                    return updatedPos[ele.id()]
                      ? updatedPos[ele.id()].y
                      : ele.position("y");
                  });
                  const visitedMaxYVal = visitedMaxY.value;
                  const lowestVisitedNode = visitedMaxY.ele;
                  // calc starting from the visually lowest already visited node if
                  // it's visually lower than prev node's y pos
                  // if not, start with prev node's y pos value
                  const areAnyVisitedNodesInTheWay =
                    visitedMaxYVal > prevNewPosY - sameRowDiffHeightSpacingY;

                  startY = areAnyVisitedNodesInTheWay
                    ? visitedMaxYVal + sameRowDiffHeightSpacingY
                    : prevNewPosY;
                  // need to add xSpacing if, in their og positions, there
                  // are unvisited nodes in between the current node and the
                  // visually lowest visited node
                  const unvisitedBetween = unvisited.filter((ele, i, eles) => {
                    return ele.position("y") > lowestVisitedNode.position("y");
                  });
                  const numUnvisitedNodesInTheWayBelowMaxVisitedNode =
                    unvisitedBetween.size();
                  const spacingBetweenVisitedAndV =
                    numUnvisitedNodesInTheWayBelowMaxVisitedNode *
                    sameRowDiffHeightSpacingY;
                  pos.y = startY + spacingBetweenVisitedAndV;
                } else {
                  const spacingBetweenNodes =
                    numUnvisited * sameRowDiffHeightSpacingY;
                  pos.y = startY + spacingBetweenNodes;
                }

                // if (numUnvisited > 0) {
                // } else {
                //   pos.y = startY;
                // }

                // formula to find y pos value:
                // either the previous node's y pos value or the greatest y pos
                // value of visited outgoers of the prev node
                // plus
                // the number of times we need to move the node down a row to
                // account for unvisited nodes that were originally above the
                // current node or the number of unvisited nodes that will be
                // positioned above the current node
                // multiplied by
                // the same row-section row-height-xSpacing]
              } else {
                pos.y = prevNewPosY;
              }
            } else {
              pos.y = prevNewPosY;
            }
            /**
             *
             *
             *
             */

            highestYPosValueInSection[row] = Math.max(
              highestYPosValueInSection[row],
              pos.y
            );

            updatedPos[vID] = pos;

            if (isInstant) {
              v.position(pos);
            } else {
              /**
               * Color animation
               */
              let vColorAni;
              const vColorAniProm = new Promise((resolve, reject) => {
                vColorAni = v.animation(
                  {
                    style: { backgroundColor: "purple" },
                  },
                  {
                    duration: durMillis / 2,
                    easing: "ease-out-quart",
                    complete: () => {
                      resolve("animating " + vID + "'s color to purple");
                    },
                  }
                );
              });

              /**
               * Move animation
               */
              let vMoveAni;
              const vMoveAniProm = new Promise((resolve, reject) => {
                vMoveAni = v.animation(
                  {
                    position: pos,
                  },
                  {
                    duration: durMillis,
                    easing: "ease-out-quart",
                    complete: () => {
                      resolve(
                        "animating " +
                          vID +
                          "'s position to " +
                          JSON.stringify(pos)
                      );
                    },
                  }
                );
              });
              // Add v's movement animation to current animations object
              currStepAnimations.vColorAniProm = vColorAniProm;
              currStepAnimations.vColorAni = vColorAni;
              currStepAnimations.vMovePos = pos;
              currStepAnimations.vMoveAniProm = vMoveAniProm;
              currStepAnimations.vMoveAni = vMoveAni;
              // Curr animations object to collective animations holder
              animations.push(currStepAnimations);
            }
            // } else {
            //   v.delayAnimation(row * 10 + durMillis + 25);
            //   vColorAni.play();
            //   v.delayAnimation(row * 10 + durMillis + 30);
            //   vMoveAni.play();
            // }
            /**
             *
             */

            /**
             *
             *
             *
             *
             *
             */
          } else {
            // We should have a previous node because we didn't find the
            // current node in roots
            throw new Error(
              vID + " doesn't have a previous node and isn't a root node."
            );
          }

          /**
           * Remember that we've visited this node by adding it to our visited
           * nodes object
           */
          visitedNodes.merge(v);
          /**
           *
           */
        }
      },
      directed: true,
    });

    /**
     *
     *  Play animations one-by-one
     *
     */
    if (!isInstant) {
      await playNodeAnimationsOneByOne(cy, animations, durMillis, xSpacing);

      // Emit event to update animation description to complete
      emitStyleEventForExplainerText(cy, "Beautiflowifying", "", false, true);
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
  }

  const { move, shiftValX, shiftValY } = annotations;
  if (move) {
    // Move annotations off to the side so nodes don't overlap any of them
    // Get the nodes in the flow/graph
    const _shiftedAnnos = await handleAnnos(cy, shiftValX, shiftValY);
  }

  /**
   * Fit the viewport to the newly adjusted nodes
   */
  const paddingPX = 25;
  cy.fit(cy.nodes('[nodeType != "ANNOTATION"]'), paddingPX);

  /**
   * Return the cytoscape object in case it's needed for anything
   */
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

export const getDateTime = () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const monthDateYear = month + "-" + date.getDate() + "-" + date.getFullYear();
  const hours24 = date.getHours();
  const meridiem = hours24 < 12 ? "am" : "pm";
  const h = hours24 % 12;
  const hours12 = h ? h : 12;
  const minutes = date.getMinutes();
  const m = minutes < 10 ? "0" + minutes : minutes;
  const seconds = date.getSeconds();
  const s = seconds < 10 ? "0" + seconds : seconds;
  const time = hours12 + "_" + m + "_" + s + "_" + meridiem;
  const dateTime = monthDateYear + "--" + time;

  return dateTime;
};

export const getFlowJSON = (ogFlowJSON, cy) => {
  const cyJSON = getCyJSON(cy);
  const dateTime = getDateTime();
  const name = "beautiflowified - " + dateTime;

  const copyOfFlowJSON = JSON.parse(JSON.stringify(ogFlowJSON));
  copyOfFlowJSON.name = copyOfFlowJSON.name
    ? name + " - " + copyOfFlowJSON.name
    : name;

  copyOfFlowJSON.graphData.elements.nodes = cyJSON.elements.nodes;
  copyOfFlowJSON.graphData.elements.edges = cyJSON.elements.edges;
  if (copyOfFlowJSON.enabledGraphData?.elements) {
    copyOfFlowJSON.enabledGraphData.elements.nodes = cyJSON.elements.nodes;
    copyOfFlowJSON.enabledGraphData.elements.edges = cyJSON.elements.edges;
  }

  copyOfFlowJSON.updatedDate = Date.now();

  return copyOfFlowJSON;
};

export const writeFlowJSON = (outputFilePath, ogFlowJSON, cy) => {
  writeFileSync(outputFilePath, getFlowJSON(ogFlowJSON, cy));
};
