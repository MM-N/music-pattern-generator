/**
 * MIDI network processor in connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorIn(specs, my) {
        var that,
            sources = [],
            numSources = 0,
            
            /**
             * Collects data from all processors this input is connected to.
             * @return {Array} MIDI event data from all connected processors.
             */
            getInputData = function() {
                var outputData = [], 
                    data = [];
                for (var i = 0; i < numSources; i++) {
                    data = sources[i].getOutputData();
                    outputData = outputData.concat(data);
                    data.length = 0;
                }
                return outputData;
            },
            
            /**
             * Connect a processor as source for this processor.
             * @param  {Object} processor Network MIDI processor.
             */
            addConnection = function(processor) {
                sources.push(processor);
                numSources = sources.length;
                console.log('Connect ' + processor.getType() + ' (id ' + processor.getID() + ') to ' + that.getType() + ' (id ' + that.getID() + ')');
            },
            
            /**
             * Remove a processor as source for this processor.
             * @param  {Object} processor Network MIDI processor.
             */
            removeConnection = function(processor) {
                var n = sources.length;
                while (--n >= 0) {
                    if (processor === sources[n]) {
                        sources.splice(n, 1);
                        numSources = sources.length;
                        console.log('Disconnect ' + processor.getType() + ' (id ' + processor.getID() + ') from ' + that.getType() + ' (id ' + that.getID() + ')');
                        break;
                    }
                }
            };
       
        my = my || {};
        my.getInputData = getInputData;

        that = specs.that || {};
        that.addConnection = addConnection;
        that.removeConnection = removeConnection;
        return that;
    };
    
    ns.createMIDIConnectorIn = createMIDIConnectorIn;

})(WH);
