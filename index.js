function isValid(stale, latest, otjson) {
    
    otjson = JSON.parse(otjson);
    let cursorPosition = 0;
    let isValidDocument = true;

    otjson.forEach((operationObject) => {
  
        //Extract the updated doc and cursor position returned after transformation
        [updatedDocument, updatedCursorPosition] = transformDocument(cursorPosition, operationObject,  stale)

        //Reassign values for next iteration
        stale = updatedDocument;
        cursorPosition = updatedCursorPosition;
      
        //If anything invalid then set boolean to false
        if (stale === null || cursorPosition === null) {
            isValidDocument = false;
        }
    })
    return isValidDocument;
}
  
function transformDocument(cursorPosition, operationObject, document) {
let updatedDocument, updatedCursorPosition;

switch (operationObject.op){
    
    case 'insert':        
        let charsToAdd = operationObject.chars;
        let firstHalf = document.slice(0, cursorPosition);
        let secondHalf = document.slice(cursorPosition)

        updatedDocument = firstHalf + charsToAdd + secondHalf;
        updatedCursorPosition = cursorPosition + charsToAdd.length;
    break;

    case 'skip':
        updatedCursorPosition = cursorPosition + operationObject.count;
        if (updatedCursorPosition > document.length) {
            //Cursor cannot go past end
            updatedCursorPosition = null;
        }
        updatedDocument = document;
    break;
    
    case 'delete':
        let cursorPositionAfterDelete = cursorPosition + operationObject.count;
        if (cursorPositionAfterDelete > document.length) {
            //Cursor cannot delete past end
            updatedCursorPosition = null;
            updatedDocument = null;
        } else {
            let firstSection = document.slice(0, cursorPosition);
            let secondSection = document.slice(cursorPositionAfterDelete);
            updatedDocument = firstSection + secondSection;
            updatedCursorPosition = cursorPositionAfterDelete;
        }
    break
    
    default:
        updatedDocument = null;
        updatedCursorPosition = null;
    break;
}

return [updatedDocument, updatedCursorPosition];
}
  
  
isValid(
'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
'Repl.it uses operational transformations.',
'[{"op": "skip", "count": 40}, {"op": "delete", "count": 47}]'
); // true

isValid(
'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
'Repl.it uses operational transformations.',
'[{"op": "skip", "count": 45}, {"op": "delete", "count": 47}]'
); // false, delete past end

isValid(
'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
'Repl.it uses operational transformations.',
'[{"op": "skip", "count": 40}, {"op": "delete", "count": 47}, {"op": "skip", "count": 2}]'
); // false, skip past end

isValid(
'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
'We use operational transformations to keep everyone in a multiplayer repl in sync.',
'[{"op": "delete", "count": 7}, {"op": "insert", "chars": "We"}, {"op": "skip", "count": 4}, {"op": "delete", "count": 1}]'
); // true

isValid(
'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
'[]'
); // true