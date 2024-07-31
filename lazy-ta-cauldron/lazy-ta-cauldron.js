/**
 * Lazy TA - A Codestrate-based teaching assistant 
 * 
 * Copyright 2020-2023 Rolf Bagge, Janus Kristensen - CAVI, Aarhus University
 * Copyright 2024 Janus Kristensen - CAVI, Aarhus University
 * 
 * MIT License:
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the “Software”), to deal in 
 * the Software without restriction, including without limitation the rights to use, 
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
 * Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 */

let taMenu = MenuSystem.MenuManager.createMenu("LazyTaInsertMenu");

function makeDescription(){
    let description = document.createElement("code-fragment");
    description.setAttribute("class", "ta-assignment");
    description.setAttribute("name", "Description");
    description.setAttribute("data-type", "text/markdown");
    description.setAttribute("auto");
    description.textContent = `## Task Header

Description of task goes here`;
    return description;
}

function makeTest(){
    let test = document.createElement("code-fragment");
    test.setAttribute("class", "ta-assignment-test");
    test.setAttribute("name", "Test Code");
    test.setAttribute("data-type", "text/javascript");
    test.setAttribute("auto");
    return test;
}

function makeCommentArea(){
    let feedback = document.createElement("code-fragment");
    feedback.setAttribute("name", "TA Feedback");
    feedback.setAttribute("data-type", "text/markdown");
    feedback.setAttribute("auto");    
    feedback.setAttribute("class","ta-assignment-comment");
    return feedback;
}

function onNewTask(context, element){
    // Add to doc
    WPMv2.stripProtection(element);
    context.context.appendChild(element);    
    
    //Find new treenode and expand
    setTimeout(()=> {
        let treeNodes = context.getTreeBrowser().findTreeNodeForContext(element);
        if (treeNodes.length > 0) {
            let treeNode = treeNodes[0];
            treeNode.reveal();
            treeNode.select();
        }
    });    
    
    // Check for theme
    if (document.querySelectorAll("task").length==1){
        if (!document.body.classList.contains("ta-white-theme")){
            if (confirm("Would you also like to add the default TA White Theme to body?")){
                document.body.classList.add("ta-white-theme");
            }
        }
    }
    
}

MenuSystem.MenuManager.registerMenuItem("TreeBrowser.TreeNode.ContextMenu", {
    label: "Insert LazyTA Assignment",
    icon: IconRegistry.createIcon("mdc:track_changes"),
    order: 100,
    group: "inserters",
    groupOrder: -1,
    onOpen: (menu)=>{
        return menu.context.type == "DomTreeNode" && !menu.context.context.matches("code-fragment");
    },
    submenu: taMenu
});

MenuSystem.MenuManager.registerMenuItem("LazyTaInsertMenu", {
    label: "Javascript Assignment",
    icon: IconRegistry.createIcon(["code-fragment:text/javascript", "mdc:insert_drive_file"]),
    onAction: (menuItem)=>{
        let taskElement = document.createElement("task");
        taskElement.setAttribute("data-type","text/javascript");

        let code = document.createElement("code-fragment");
        code.setAttribute("class","ta-assignment-code");
        code.setAttribute("name","Student Code");
        code.setAttribute("data-type","text/javascript");        
        code.textContent = '/* Write your JS code here */';

        taskElement.appendChild(makeDescription());
        taskElement.appendChild(code);
        taskElement.appendChild(makeTest());
        taskElement.appendChild(makeCommentArea());
        
        onNewTask(menuItem.menu.superMenu.context, taskElement);
    }
});

MenuSystem.MenuManager.registerMenuItem("LazyTaInsertMenu", {
    label: "CSS Assignment",
    icon: IconRegistry.createIcon(["code-fragment:text/css", "mdc:insert_drive_file"]),
    onAction: (menuItem)=>{
        let taskElement = document.createElement("task");
        taskElement.setAttribute("data-type","text/css");
        
        let view = document.createElement("code-fragment");
        view.setAttribute("class","ta-assignment-view");
        view.setAttribute("name","View");
        view.setAttribute("data-type","text/html");
        view.textContent = "HTML code goes here";
                
        let code = document.createElement("code-fragment");
        code.setAttribute("class","ta-assignment-code");
        code.setAttribute("name","Student Code");
        code.setAttribute("data-type","text/css");        
        code.textContent = '/* Write your CSS code here */';

        taskElement.appendChild(makeDescription());
        taskElement.appendChild(view);
        taskElement.appendChild(code);
        taskElement.appendChild(makeTest());
        taskElement.appendChild(makeCommentArea());
                
        onNewTask(menuItem.menu.superMenu.context, taskElement);
    }
});

MenuSystem.MenuManager.registerMenuItem("LazyTaInsertMenu", {
    label: "JS DOM Assignment",
    icon: IconRegistry.createIcon(["code-fragment:text/html", "mdc:insert_drive_file"]),
    onAction: (menuItem)=>{
        let taskElement = document.createElement("task");
        taskElement.setAttribute("data-type","text/javascript");
        
        let view = document.createElement("code-fragment");
        view.setAttribute("class","ta-assignment-dom");
        view.setAttribute("name","HTML Code");
        view.setAttribute("data-type","text/html");
        view.textContent = "HTML code goes here";

        let css = document.createElement("code-fragment");
        css.setAttribute("class","ta-assignment-css");
        css.setAttribute("name","CSS Code");
        css.setAttribute("data-type","text/css");
        css.textContent = "/* CSS here */";        
        
        let code = document.createElement("code-fragment");
        code.setAttribute("class","ta-assignment-code");
        code.setAttribute("name","Student Code");
        code.setAttribute("data-type","text/javascript");        
        code.textContent = '/* Write your JS code here */';

        taskElement.appendChild(makeDescription());
        taskElement.appendChild(view);
        taskElement.appendChild(css);
        taskElement.appendChild(code);
        taskElement.appendChild(makeTest());
        taskElement.appendChild(makeCommentArea());
                
        onNewTask(menuItem.menu.superMenu.context, taskElement);
    }
});
