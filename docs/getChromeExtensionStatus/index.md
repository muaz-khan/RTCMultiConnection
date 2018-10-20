---
api_name: getChromeExtensionStatus
api_description: Use this method to check if your chrome screen sharing extension is installed and enabled
css: 
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
connection.getChromeExtensionStatus('optional-extensionid', function(status) {
    if(status == 'installed-enabled') {
        // chrome extension is installed & enabled.
    }
    
    if(status == 'installed-disabled') {
        // chrome extension is installed but disabled.
    }
    
    if(status == 'not-installed') {
        // chrome extension is not installed
    }
    
    if(status == 'not-chrome') {
        // using non-chrome browser
    }
});
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}

