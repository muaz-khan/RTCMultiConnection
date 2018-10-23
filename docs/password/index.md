---
api_name: password
api_description: Set password to protect your room
---

{% capture html %}

<section>
    <h2>Simple Usage</h2>
<pre><code class="javascript">
connection.password = 'abcdef';
connection.open('room-id', function(isRoomOpened, roomid, error) {
    if(isRoomOpened === true) {
        alert('Room opened with password: ' + connection.password);
    }
});
</code></pre>
    <p>Please try this demo: <a href="https://rtcmulticonnection.herokuapp.com/demos/Password-Protected-Rooms.html">demos/Password-Protected-Rooms.html</a></p>
</section>

<section>
    <h2>Advance Usage</h2>
<pre><code class="javascript">
// HTML Elements:
// &lt;input type="text" id="room-id"&gt;
// &lt;button id="open-room"&gt;open-room&lt;/button&gt;
// &lt;button id="join-room"&gt;join-room&lt;/button&gt;
// &lt;input type="checkbox" id="protect-room-with-password" checked&gt;
document.getElementById('open-room').onclick = function() {
    if (document.getElementById('protect-room-with-password').checked === true) {
        var password = prompt('Please Enter Password');
        if (!password || !password.length) {
            alert('Please enter a valid password.');
            return;
        }

        connection.password = password; // &lt;------check this line
    }

    connection.open(document.getElementById('room-id').value, function(isRoomOpened, roomid, error) {
        if (error) {
            if (error === 'Room not available') {
                alert('Someone already created this room. Please either join or create a separate room.');
                return;
            }

            alert(error);
        }
    });
};

document.getElementById('join-room').onclick = function() {
    if (document.getElementById('protect-room-with-password').checked === true) {
        var password = prompt('Please Enter Password');
        if (!password || !password.length) {
            alert('Please enter a valid password.');
            return;
        }

        connection.password = password;
    }

    connection.join(document.getElementById('room-id').value, function(isJoinedRoom, roomid, error) {
        if (error) {
            if (error === 'Invalid password') {
                var password = prompt('Please Enter Password');
                if (!password || !password.length) {
                    alert(error);
                    return;
                }
                connection.password = password;
                document.getElementById('join-room').onclick();
                return;
            }
            if (error === 'Room not available') {
                alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                return;
            }
            alert(error);
        }
    });
};
</code></pre>
</section>

{% endcapture %}
{% include html_snippet.html html=html %}
