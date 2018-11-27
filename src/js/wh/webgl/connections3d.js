import {
  BufferAttribute,
  BufferGeometry,
  Color,
  CubicBezierCurve,
  Geometry,
  Group,
  Line,
  LineBasicMaterial,
  Object3D,
  Shape,
  Vector2,
  Vector3,
} from '../../lib/three.module.js';
import { getThemeColors } from '../state/selectors.js';
import { createCircleFilled, createCircleOutline } from './util3d.js';

export default function addConnections3d(specs, my) {
  let that,
    store = specs.store,
    state = {
      sourceProcessorID: null,
      sourceConnectorID: null,
      sourceConnectorPosition: null,
    },
    defaultColor,
    lineMaterial,
    currentCable,
    currentCableDragHandle,
    cablesGroup,
    deleteButtonRadius = 2.0,
    deleteCrossRadius = 0.8,
    dragHandleRadius = 1.5,
    
    init = function() {
      currentCableDragHandle = createCircleOutline(lineMaterial, dragHandleRadius);
      currentCableDragHandle.name = 'dragHandle';

      document.addEventListener(store.STATE_CHANGE, (e) => {
        switch (e.detail.action.type) {

          case e.detail.actions.TOGGLE_CONNECT_MODE:
            toggleConnectMode(e.detail.state.connectModeActive);
            break;
          
          case e.detail.actions.DELETE_PROCESSOR:
          case e.detail.actions.CONNECT_PROCESSORS:
          case e.detail.actions.DISCONNECT_PROCESSORS:
            updateCables(e.detail.state);
            drawCables(e.detail.state);
            break;
          
          case e.detail.actions.DRAG_SELECTED_PROCESSOR:
          case e.detail.actions.DRAG_ALL_PROCESSORS:
            drawCables(e.detail.state);
            break;
          
          case e.detail.actions.CREATE_PROJECT:
            setTheme();
            updateCables(e.detail.state);
            drawCables(e.detail.state);
            break;

          case e.detail.actions.SET_THEME:
            setTheme();
            toggleConnectMode(e.detail.state.connectModeActive);
            break;
        }
      });
    },
        
    /**
     * Start dragging a connection cable.
     * @param {String} sourceProcessorID
     * @param {String} sourceConnectorID
     * @param {Vector3} sourceConnectorPosition
     */
    dragStartConnection = function(sourceProcessorID, sourceConnectorID, sourceConnectorPosition) {
      state = { ...state, sourceProcessorID, sourceConnectorID, sourceConnectorPosition, };
      currentCable = new Line(new BufferGeometry(), lineMaterial);
      currentCable.name = 'currentCable';
      cablesGroup.add(currentCable);

      currentCableDragHandle.position.copy(sourceConnectorPosition);
      cablesGroup.add(currentCableDragHandle);
    },
        
    /**
     * Drag a connection cable.
     * @param {Vector3} position3d
     */
    dragMoveConnection = function(position3d) {
      drawCable(
        currentCable.name,
        new Vector2(state.sourceConnectorPosition.x, state.sourceConnectorPosition.y), 
        new Vector2(position3d.x, position3d.y));
      currentCableDragHandle.position.copy(position3d);
    },
        
    /**
     * Drag connection cable ended.
     */
    dragEndConnection = function() {
      currentCable.geometry.dispose();
      currentCable.geometry = new Geometry();
      cablesGroup.remove(currentCable);
      cablesGroup.remove(currentCableDragHandle);
    },

    /**
     * Create connection between two processors.
     * @param {String} destinationProcessorID Processor ID.
     * @param {String} destinationConnectorID Connector ID.
     */
    createConnection = function(destinationProcessorID, destinationConnectorID) {
      store.dispatch(store.getActions().connectProcessors({
        sourceProcessorID: state.sourceProcessorID, 
        sourceConnectorID: state.sourceConnectorID,
        destinationProcessorID: destinationProcessorID,
        destinationConnectorID: destinationConnectorID,
      }));
      state.sourceProcessorID = null;
      state.sourceConnectorID = null;
    },

    /**
     * Create and delete cables acctording to the state.
     * @param {Object} state Application state.
     */
    updateCables = function(state) {
      if (!cablesGroup) {
        cablesGroup = new Group();
        my.cablesGroup = cablesGroup;
        my.scene.add(cablesGroup);
      }

      // delete all removed cables
      cablesGroup.children.forEach(cable => {
        if (state.connections.allIds.indexOf(cable.name) === -1) {
          cablesGroup.remove(cable);
        }
      });

      // create all new cables
      state.connections.allIds.forEach(connectionId => {
        if (!cablesGroup.getObjectByName(connectionId)) {
          createCable(connectionId);
        }
      });
    },

    /**
     * Draw all cables acctording to the state.
     * @param {String} connectionID Connection ID.
     * @return {Object} Cable object3d.
     */
    createCable = function(connectionID) {
      const cable = new Line(new BufferGeometry(), lineMaterial);
      cable.name = connectionID;
      cable.userData.type = 'cable';
      cablesGroup.add(cable);

      const deleteBtn = createCircleOutline(lineMaterial, deleteButtonRadius);
      deleteBtn.name = 'delete';
      deleteBtn.visible = false;
      cable.add(deleteBtn);

      const deleteBtnFill = createCircleFilled(lineMaterial.color, deleteButtonRadius, 0);
      deleteBtn.add(deleteBtnFill);

      let line = new Line(new BufferGeometry(), lineMaterial);
      line.geometry.addAttribute('position', new BufferAttribute( new Float32Array([
        -deleteCrossRadius, -deleteCrossRadius, 0.0,
         deleteCrossRadius,  deleteCrossRadius, 0.0
      ]), 3));
      deleteBtn.add(line);

      line = new Line(new BufferGeometry(), lineMaterial);
      line.geometry.addAttribute('position', new BufferAttribute( new Float32Array([
        -deleteCrossRadius,  deleteCrossRadius, 0.0,
         deleteCrossRadius, -deleteCrossRadius, 0.0
      ]), 3));
      deleteBtn.add(line);

      return cable;
    },

    /**
     * Draw all cables acctording to the state.
     * @param {Object} state Application state.
     */
    drawCables = function(state) {
      state.connections.allIds.forEach(connectionID => {
        const connection = state.connections.byId[connectionID];
        const sourceProcessor = state.processors.byId[connection.sourceProcessorID];
        const destinationProcessor = state.processors.byId[connection.destinationProcessorID];

        if (sourceProcessor && destinationProcessor) {
          const sourceConnector = sourceProcessor.outputs.byId[connection.sourceConnectorID];
          const destinationConnector = destinationProcessor.inputs.byId[connection.destinationConnectorID];
          
          const cable = cablesGroup.getObjectByName(connectionID);
          drawCable(
            connectionID,
            new Vector2(
              sourceProcessor.positionX + sourceConnector.x,
              sourceProcessor.positionY + sourceConnector.y,), 
            new Vector2(
              destinationProcessor.positionX + destinationConnector.x,
              destinationProcessor.positionY + destinationConnector.y,));
        }
      });
    },

    /**
     * Enter or leave application connect mode.
     * @param {Vector3} sourcePosition Cable start position.
     * @param {Vector3} destinationPosition Cable end position.
     */
    drawCable = function(connectionID, sourcePosition, destinationPosition) {
      const cable = cablesGroup.getObjectByName(connectionID);
      if (cable) {
        const distance = sourcePosition.distanceTo(destinationPosition);
        const curveStrength = Math.min(distance / 2, 30);
        const curve = new CubicBezierCurve(
          sourcePosition.clone(),
          sourcePosition.clone().sub(new Vector2(0, curveStrength)),
          destinationPosition.clone().add(new Vector2(0, curveStrength)),
          destinationPosition.clone()
        );
        const points = curve.getPoints(50);
        cable.geometry.dispose();
        cable.geometry.setFromPoints(points);

        if (my.isConnectMode) {
          const deleteBtn = cable.getObjectByName('delete');
          if (deleteBtn) {
            setDeletePosition(cable, deleteBtn);
          }
        }
      }
    },

    /**
     * Position the delete button halfway the cable.
     * @param {Object} cable Cable object3d.
     * @param {Object} deleteBtn Delete button object3d.
     */
    setDeletePosition = function(cable, deleteBtn) {
      const position = cable.geometry.getAttribute('position');
      const index = Math.floor(position.count / 2) * position.itemSize;
      deleteBtn.position.x = position.array[index];
      deleteBtn.position.y = position.array[index + 1];
    },

    /**
     * Enter or leave application connect mode.
     * @param {Boolean} isEnabled True to enable connect mode.
     */
    toggleConnectMode = function(isEnabled) {
        my.isConnectMode = isEnabled;

        // toggle cable delete buttons
        cablesGroup.children.forEach(cable => {
          const deleteBtn = cable.getObjectByName('delete');
          deleteBtn.visible = my.isConnectMode;
          
          // position the delete buttons halfway the cable
          if (my.isConnectMode) {
            setDeletePosition(cable, deleteBtn);
          }
        });
    },

    /**
     * Update theme colors.
     */
    setTheme = function() {
      defaultColor = getThemeColors().colorHigh;
      lineMaterial = new LineBasicMaterial({
        color: defaultColor,
      });
      currentCableDragHandle.material.color.set( defaultColor );
    };
  
  my = my || {};
  my.isConnectMode = false,
  my.cablesGroup = cablesGroup;
  my.dragStartConnection = dragStartConnection;
  my.dragMoveConnection = dragMoveConnection;
  my.dragEndConnection = dragEndConnection;
  my.createConnection = createConnection;
  
  that = specs.that || {};
  
  init();
  
  return that;
}