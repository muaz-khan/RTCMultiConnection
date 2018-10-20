---
api_name: Translator
api_description: This object allows you pass any text and convert into 100+ languages
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre>
<pre class="sh_javascript">
connection.Translator.TranslateText(textToConvert, function(convertedText) {
     console.log(convertedText);
});
</pre>
</pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
