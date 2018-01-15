/**
 * Utilities
 * Mouse or touch event detection.
 */
export const util = ( function() {
    const isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
    
    /**
     * Type of events to use, touch or mouse
     * @type {String}
     */
    const eventType = {
        start: isTouchDevice ? 'touchstart' : 'mousedown',
        end: isTouchDevice ? 'touchend' : 'mouseup',
        click: isTouchDevice ? 'touchend' : 'click',
        move: isTouchDevice ? 'touchmove' : 'mousemove',
    };

    /**
     * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     */
    const createUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    return {
        isTouchDevice: isTouchDevice,
        eventType: eventType,
        createUUID: createUUID
    }
})();
