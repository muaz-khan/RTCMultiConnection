---
api_name: language
api_description: Set translation language
---

{% capture html %}

<section>
    <h2>How to use</h2>
    <pre class="sh_javascript">
connection.language = 'ja'; // prefer Japanese
connection.autoTranslateText = true;

// you can use "e.data" and "e.original"
connection.onmessage = function(e) {
   // e.data     ---- translated text
   // e.original ---- original text
};
</pre>
</section>

<section>
    <h2>List of supported languages (41):</h2>
                <table>
                    <tr>
                        <td>English</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'en';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Arabic (العربية)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ar';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Chinese (Simplified Han) [中文简体]</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'zh-CN';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Chinese (Traditional Han) [中國傳統]</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'zh-TW';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Russian (Русский)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ru';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Dutch</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'de';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>French (Français)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'fr';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Hindi (हिंदी)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'hi';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Portuguese (Português)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'pt';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Spanish (Español)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'es';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Turkish (Türk)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'tr';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Nederlands</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'nl';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Italiano</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'it';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Polish (Polski)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'pl';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Roman (Român)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ro';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Swedish (Svensk)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'sv';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Vietnam (Việt)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'vi';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td> Thai(ภาษาไทย)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'th';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Japanese (日本人)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ja';
</pre>
                        </td>
                    </tr>
                    <tr>
                        <td>Korean (한국의)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ko';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Greek (ελληνικά)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'el';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Tamil (தமிழ்)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ts';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Armenian (հայերեն)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'hy';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Bosnian (Bosanski)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'bs';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Catalan (Català)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ca';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Croatian (Hrvatski)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'hr';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Danish (Dansk)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'dq';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Esperanto</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'eo';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Finnish (Suomalainen)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'fi';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Haitian Creole (Haitian kreyòl)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ht';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Hungarian (Magyar)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'hu';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Icelandic</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'is';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Indonesian</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'id';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Latin (Latinum)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'la';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Latvija (Latvijas or lætviə)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'lv';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Macedonian (Македонски)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'mk';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Norwegian (norsk)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'no';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Serbian (српски)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'sr';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Slovak (Slovenský)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'sk';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Swahili (Kiswahili)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'ws';
</pre>
                        </td>
                    </tr>
                    
                    <tr>
                        <td>Welsh (Cymraeg)</td>
                        <td>
                            <pre class="sh_javascript">
connection.language = 'cy';
</pre>
                        </td>
                    </tr>
                    
                </table>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
