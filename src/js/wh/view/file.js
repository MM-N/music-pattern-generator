/**
 * @description File handling view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 */
export default function createFileView(specs) {
    var that,
        file = specs.file,
        fileEl,
        
        init = function() {
            fileEl = document.querySelector('.file');
            fileEl.querySelector('.file__new').addEventListener('click', function(e) {
                file.createNew();
            });
            fileEl.querySelector('.file__import').addEventListener('change', function(e) {
                file.importFile(e.target.files[0]);
                this.value = null;
            });
            fileEl.querySelector('.file__export').addEventListener('click', function(e) {
                file.exportFile();
            });
        };
    
    that = specs.that;
    
    init();
    
    return that;
}