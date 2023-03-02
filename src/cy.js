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
    throw new Error("Could not extract graph data", { cause: error });
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
  const minXCyNode = cyNodes.min((ele, i, eles) => ele.position("y")).ele;

  return minXCyNode;
};

export const getMinYCyNode = (cyNodes) => {
  const minYCyNode = cyNodes.min((ele, i, eles) => ele.position("y")).ele;

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
    const width = ele.data("properties").width.value;
    const newPosX = posX + width / 2;
    ele.position("x", newPosX);
  });

  return nodes;
};

export const resetAnnosPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');

  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width.value;
    const newPosX = posX + width / 2;
    ele.position("x", -newPosX);
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

export const playNodeAnimationsOneByOne = async (cy, animations, dur) => {
  // Emits an event that we can watch for in the main app UI to update the text
  // of the animation description box
  emitStyleEventForExplainerText(cy, "Beautiflowifying", "", true, false);

  for (const ani of animations) {
    const {
      preID,
      preAniProm,
      preAni,
      currID,
      currAni,
      currAniProm,
      rootID,
      rootAni,
      rootAniProm,
      newRootPos,
      vMovePos,
      vMoveAni,
      vMoveAniProm,
    } = ani;
    let msg;

    // Need to figure out how to calculate for rows with multiple levels
    if (rootID) {
      let viewportAni;
      cy.fit(newRootPos, 50);

      const viewportAniProm = new Promise((resolve, reject) => {
        viewportAni = cy.animation({
          zoom: {
            level: 0.3,
            position: newRootPos,
          },
          duration: dur / 2,
          complete: () =>
            resolve("Adjusted viewport (panBy) to animating elements"),
        });
      });
      viewportAni.play();
      await viewportAniProm;
    }

    if (preAniProm && preAni) {
      msg = "animating " + preID;
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        preID,
        cy,
        preAni,
        preAniProm
      );
    }

    msg = "animating " + currID;
    const currAniResolvedMsg = await emitAndWaitForAni(
      msg,
      currID,
      cy,
      currAni,
      currAniProm
    );

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

    // Change prev node to green as its processing is complete
    if (preID) {
      msg = "prev node " + preID + " processing is complete animation";
      const { ani: doneWithPrevNodeAni, prom } = getAnimationPromiseForEle(
        cy.$("#" + preID),
        dur,
        "green"
      );
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        preID,
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
      msg = "prev node " + preID + " processing is finished animation";
      const { ani: doneWithCurrLeafNodeAni, prom } = getAnimationPromiseForEle(
        cy.$("#" + currID),
        dur,
        "green"
      );
      const resolvedMsg = await emitAndWaitForAni(
        msg,
        preID,
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

export const beautiflowify = async (
  cy,
  spacing,
  verticalTolerance,
  dur,
  watchAnimation
) => {
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
  cy.json(collWithNormalizedNodePos.jsons());

  const roots = normalizedNodesWOAnnotations.roots();
  const rootsSorted = sortRoots(roots, verticalTolerance);
  cy.fit(getRowOfNodesFromRoot(rootsSorted.first()), 150);

  // Just in case, lock annotations' pos
  lockAnnotationPositions(cy);

  const visitedNodes = cy.collection();
  const updatedPos = {};
  const rowStartPosX = 0;
  const firstRowStartPosY = 180;
  const sameRowDiffHeightSpacingY = 240;
  const sectionBaselinePosY = [];
  const rowSpacingY = 300;
  const highestYPosValueInSection = [];
  // For (const ele of roots) {
  for (let row = 0; row < rootsSorted.length; row++) {
    const ele = rootsSorted[row];
    const animations = [];
    const nodesInCurrRow = getRowOfNodesFromRoot(ele);
    const nodesInCurrRowClone = nodesInCurrRow.clone();
    /**
     * sectionBasePosY is the y-value for the starting nodes and any following
     * nodes along that same horizontal line
     *
     * if row > 0,
     * take the lowest y value of the previous section and add our row spacing
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
     * BFS
     *
     * runs @see {@link Cytoscape#breadthFirstSearch} on nodes in the same
     * section as the current iterated root node
     */
    nodesInCurrRow.breadthFirstSearch({
      root: ele,
      visit: async (v, edge, prev, j, depth) => {
        const currStepAnimations = {};
        const vPos = v.position();
        const vID = v.id();
        let prevNodeAniProm;
        let prevNodeAni;
        let currNodeAniProm;
        let currNodeAni;
        const pos = {};

        // Skip if we've already visited this node
        if (!visitedNodes.anySame(v)) {
          const vSuccessors = v.successors();

          /**
           * Current node color animation
           */
          currNodeAniProm = new Promise((resolve, reject) => {
            currNodeAni = v.animation(
              {
                style: { backgroundColor: "yellow" },
              },
              {
                duration: dur,
                complete: () => resolve("animated " + vID),
              }
            );
          });

          if (watchAnimation) {
            currStepAnimations.currID = vID;
            currStepAnimations.currAni = currNodeAni;
            currStepAnimations.currAniProm = currNodeAniProm;
          } else {
            currNodeAni.play();
          }
          /**
           *
           */

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

            if (vSuccessors.anySame(visitedNodes)) {
              // This root contains a path that leads into nodes we've already
              // visited
              // Get the edges and sources coming into vSuccessors
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
              const maxOfRow = visitedNodes.max((ele, i, eles) =>
                ele.position("y")
              );
              highestYPosValueInSection[row] = Math.max(pos.y, maxOfRow.value);
            } else {
              pos.y = sectionBaselinePosY[row];

              highestYPosValueInSection[row] = Math.max(
                highestYPosValueInSection[row],
                pos.y
              );
            }

            /**
             * Root node animation
             * color and position
             */
            let rootAni;
            pos.x = rowStartPosX;
            const rootAniProm = new Promise((resolve, reject) => {
              rootAni = v.animation(
                {
                  position: pos,
                  style: { backgroundColor: "white" },
                },
                {
                  duration: dur,
                  complete: () => {
                    resolve("animating root " + vID);
                  },
                }
              );
            });

            updatedPos[vID] = pos;

            if (watchAnimation) {
              currStepAnimations.rootID = vID;
              currStepAnimations.rootAniProm = rootAniProm;
              currStepAnimations.rootAni = rootAni;
              currStepAnimations.newRootPos = pos;
              animations.push(currStepAnimations);
            } else {
              rootAni.play();
            }
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
            const prevOutgoerNodes = prev.outgoers("node");
            // New x pos variable
            const posX = spacing * depth + rowStartPosX;

            /**
             *
             * Animate previous node's (source node) color
             *
             */
            prevNodeAniProm = new Promise((resolve, reject) => {
              prevNodeAni = prev.animation(
                {
                  style: { backgroundColor: "blue" },
                },
                {
                  duration: dur,
                  complete: () => resolve("animated " + prevID),
                }
              );
            });

            if (watchAnimation) {
              currStepAnimations.preID = prev?.id();
              currStepAnimations.preAniProm = prevNodeAniProm;
              currStepAnimations.preAni = prevNodeAni;
            } else {
              prevNodeAni.play();
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
            // Get the eles already visited and is a successor of the current
            // node and the current node itself and find the max y position
            // value out of them
            //
            // e.g.,
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
              const prevOutgoerNodesSorted = prevOutgoerNodes.sort(
                (ele1, ele2) => ele1.position("y") - ele2.position("y")
              );
              const prevOutgoerNodesSortedArr =
                prevOutgoerNodesSorted.toArray();
              const prevNewPosy = updatedPos[prevID].y;

              // of the previous node's outgoers
              // which have already been visited,
              // find the max y value,
              // then add same row vertical spacing
              const visitedPrevOutgoers =
                prevOutgoerNodes.intersection(visitedNodes);

              if (visitedPrevOutgoers.size() > 0) {
                const maxPosY = visitedPrevOutgoers.max((ele, i, eles) => {
                  return updatedPos[ele.id()].y;
                });
                const maxPosYValue = maxPosY.value;
                const maxPosYValPlusSameRowVertSpacing =
                  maxPosYValue + sameRowDiffHeightSpacingY;
                pos.y = Math.max(
                  maxPosYValPlusSameRowVertSpacing,
                  updatedPos[prevID].y
                );
              } else {
                pos.y = prevNewPosy;
              }
            } else {
              pos.y = updatedPos[prevID].y;
            }
            /**
             *
             */

            highestYPosValueInSection[row] = Math.max(
              highestYPosValueInSection[row],
              pos.y
            );

            updatedPos[vID] = pos;

            /**
             * Move animation
             */
            let vMoveAni;
            const vMoveAniProm = new Promise((resolve, reject) => {
              vMoveAni = v.animation(
                {
                  position: pos,
                  style: { backgroundColor: "purple" },
                },
                {
                  duration: dur,
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

            if (watchAnimation) {
              // Add v's movement animation to current animations object
              currStepAnimations.vMovePos = pos;
              currStepAnimations.vMoveAniProm = vMoveAniProm;
              currStepAnimations.vMoveAni = vMoveAni;
              // Curr animations object to collective animations holder
              animations.push(currStepAnimations);
            } else {
              vMoveAni.play();
            }
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
    if (watchAnimation) {
      await playNodeAnimationsOneByOne(cy, animations, dur);
    }

    // Emit event to update animation description to complete
    emitStyleEventForExplainerText(cy, "Beautiflowifying", "", false, true);
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
  const monthDateYear =
    month + 1 + "-" + date.getDate() + "-" + date.getFullYear();
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
