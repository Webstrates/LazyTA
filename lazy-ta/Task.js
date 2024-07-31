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

/* global Fragment, EditorManager, CodemirrorEditor, WPMv2 */
window.Task = class Task {
    constructor(html) {
        let self = this;

        this.html = html;

        this.html.lazyTATask = this;

        this.codeEditor = null;
        this.commentEditor = null;

        this.assignment = Fragment.one(this.html.querySelector(".ta-assignment"));
        this.code = Fragment.one(this.html.querySelector(".ta-assignment-code"));
        this.testCode = Fragment.one(this.html.querySelector(".ta-assignment-test"));
        this.exampleView = Fragment.one(this.html.querySelector(".ta-assignment-view"));
        this.comments = Fragment.one(this.html.querySelector(".ta-assignment-comment"));
        this.dom = Fragment.one(this.html.querySelector(".ta-assignment-dom"));
        this.css = Fragment.one(this.html.querySelector(".ta-assignment-css"));
        
        if (!this.html.querySelector(".feedback")){
            let feedback = document.createElement("transient");
            feedback.setAttribute("class","feedback");
            this.code.element.parentNode.insertBefore(feedback, this.code.element.nextSibling);
        }

        // Send code changes to the evaluator
        this.code.registerOnFragmentChangedHandler(function () {
            clearTimeout(self.feedbackTimer);
            self.feedbackTimer = setTimeout(function () {
                if(self.shouldAutoEvaluate()) {
                    self.evaluate();
                }
            }, 1000);
        });

        if(this.dom != null) {
            let previewButton = document.createElement("i");
            previewButton.classList.add("code-preview-button");
            previewButton.classList.add("fas");
            previewButton.classList.add("fa-eye");
            previewButton.title = "Toggle code preview";

            this.dom.element.parentNode.insertBefore(previewButton, this.dom.element);

            previewButton.addEventListener("click", ()=>{
                self.toggleDomPreview();

                previewButton.classList.remove("fa-eye");
                previewButton.classList.remove("fa-eye-slash");

                if (this.html.querySelector(".previewEditor")){
                    previewButton.classList.add("fa-eye-slash");
                } else {
                    previewButton.classList.add("fa-eye");
                }
            });
        }

        if(this.exampleView != null) {
            let previewButton = document.createElement("i");
            previewButton.classList.add("code-preview-button");
            previewButton.classList.add("fas");
            previewButton.classList.add("fa-eye");
            previewButton.title = "Toggle code preview";

            this.exampleView.element.parentNode.insertBefore(previewButton, this.exampleView.element);

            previewButton.addEventListener("click", ()=>{
                self.toggleExampleViewPreview();

                previewButton.classList.remove("fa-eye");
                previewButton.classList.remove("fa-eye-slash");

                if (this.html.querySelector(".previewEditor")){
                    previewButton.classList.add("fa-eye-slash");
                } else {
                    previewButton.classList.add("fa-eye");
                }
            });
        }

        let runButton = document.createElement("i");
        runButton.setAttribute("class","task-run-button fas fa-play-circle");
        runButton.addEventListener("click", ()=>{
            self.evaluate();
        })

        let autoObserver = new MutationObserver((mutations)=>{
            if(self.html.classList.contains("noauto")) {
                this.code.element.parentNode.insertBefore(runButton, this.code.element);
            } else {
                runButton.remove();
            }
        });

        autoObserver.observe(this.html, {
            attributes: true,
            attributeFilter: ["class"]
        });

        if(self.html.classList.contains("noauto")) {
            this.code.element.parentNode.insertBefore(runButton, this.code.element);
        }

        this.toggleCodeEditor();
        this.showExampleView();

        const urlParams = new URLSearchParams(window.location.search);
        const taEnabled = urlParams.get('ta') != null;

        if(taEnabled) {
            this.toggleCommentEditor();
            if(this.shouldAutoEvaluate()) {
                this.evaluate();
            }
        }
    }

    shouldAutoEvaluate() {
        return !this.html.classList.contains("noauto");
    }

    toggleCommentEditor() {
        if(this.commentEditor == null) {
            this.commentEditor = EditorManager.createEditor(this.comments, {theme: "light", mode:"inline", editor: MonacoEditor})[0];
        }

        if (this.commentEditor.html.parents().is("body")) {
            //Already in dom, remove
            this.commentEditor.html.remove();
        } else {
            //Not in dom, insert.
            let anchor = this.html.querySelector(".ta-assignment-comment");
            anchor.parentNode.insertBefore(this.commentEditor.html[0], anchor.nextSibling);
        }
    }

    toggleCodeEditor() {
        if(this.codeEditor == null) {
            this.codeEditor = EditorManager.createEditor(this.code, {theme: "light", mode:"full", editor: MonacoEditor})[0];
        }
        
        if (this.codeEditor.html.parents().is("body")) {
            //Already in dom, remove
            this.codeEditor.html.remove();
        } else {
            //Not in dom, insert.
            let anchor = this.html.querySelector(".ta-assignment-code");
            anchor.parentNode.insertBefore(this.codeEditor.html[0], anchor.nextSibling);
        }
    }

    toggleExampleViewPreview() {
        if(this.exampleViewPreview == null) {
            this.exampleViewPreview = EditorManager.createEditor(this.exampleView, {
                theme: "light",
                mode: "full",
                readOnly: true,
                editor: MonacoEditor
            })[0];

            this.exampleViewPreview.html.addClass("previewEditor");
        }

        if(!this.exampleViewPreview.html.parents().is("body")) {
            this.exampleView.html[0].parentNode.insertBefore(this.exampleViewPreview.html[0], this.exampleView.html[0]);
        } else {
            this.exampleViewPreview.html.remove();
        }
    }

    toggleDomPreview() {
        if(this.domPreview == null) {
            this.domPreview = EditorManager.createEditor(this.dom, {
                theme: "light",
                mode: "full",
                readOnly: true,
                editor: MonacoEditor
            })[0];

            this.domPreview.html.addClass("previewEditor");
        }

        if(!this.domPreview.html.parents().is("body")) {
            this.dom.element.parentNode.insertBefore(this.domPreview.html[0], this.dom.element);
        } else {
            this.domPreview.html.remove();
        }
    }

    showExampleView() {
        let self = this;
        if (this.exampleView !== null) {
            this.exampleViewFrame = document.createElement("div");
            this.exampleViewFrame.setAttribute("class", "ta-assignment-exampleview");
            this.exampleViewFrame.setAttribute("transient-element", "true");
            this.exampleView.element.parentNode.insertBefore(this.exampleViewFrame, this.exampleView.element.nextSibling);
            let shadow = this.exampleViewFrame.attachShadow({mode:"open"});

            async function update() {
                let code = await self.code.require();
                shadow.innerHTML = self.exampleView.raw;
                shadow.append(code);
            }

            this.exampleView.registerOnFragmentChangedHandler(() => {
                update();
            });
            this.code.registerOnFragmentChangedHandler(() => {
                update();
            });

            //Some browsers load a page after insertion of iframe, so make sure we catch this event too.
            this.exampleViewFrame.onload = () => {
                update();
            };

            update();
        }
    }

    getTestContext() {
        let feedback = this.html.querySelector(".feedback");

        let context = {
            success: (msg)=>{
                let el = document.createElement("div");
                el.setAttribute("class", "success");
                el.innerHTML = msg;
                feedback.appendChild(el);
            },
            fail: (msg)=>{
                let el = document.createElement("div");
                el.setAttribute("class", "fail");
                el.innerHTML = msg;
                feedback.appendChild(el);
            },
            error: (msg)=>{
                let el = document.createElement("div");
                el.setAttribute("class", "error");
                el.innerHTML = msg;
                feedback.appendChild(el);
            },
            console: {
                log: (...args)=>{
                    console.log("[EVAL]", ...args);
                }
            }
        };

        // Use view if applicable
        if (this.exampleViewFrame != null) {
            context.document = this.exampleViewFrame.shadowRoot;
        }
        
        return context;
    }
};
