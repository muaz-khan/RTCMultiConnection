---
api_name: checkIfChromeExtensionAvailable
api_description: Use this method to check if your chrome screen sharing extension is installed
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.checkIfChromeExtensionAvailable(function(isChromeExtensionAvailable) {
    if(isChromeExtensionAvailable === true) {
        alert('installed');
    }
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

