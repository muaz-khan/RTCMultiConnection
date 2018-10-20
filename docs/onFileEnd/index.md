---
api_name: onFileEnd
api_description: This event is fired when file is successfully sent or received
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.onFileEnd = function (file) {
    progressHelper[file.uuid].div.innerHTML = '&lt;a href="' + file.url + '" target="_blank" download="' + file.name + '"&gt;' + file.name + '&lt;/a&gt;';
};

// to make sure file-saver dialog is not invoked.
connection.autoSaveToDisk = false;

var progressHelper = {};

connection.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

connection.onFileStart = function (file) {
    var div = document.createElement('div');
    div.title = file.name;
    div.innerHTML = '&lt;label&gt;0%&lt;/label&gt; &lt;progress&gt;&lt;/progress&gt;';
    document.body.appendChild(div);
    progressHelper[file.uuid] = {
        div: div,
        progress: div.querySelector('progress'),
        label: div.querySelector('label')
    };
    progressHelper[file.uuid].progress.max = file.maxChunks;
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
