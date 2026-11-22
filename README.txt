KLEIDERSTUDIO

LOKAL STARTEN
Den ganzen Ordner entpacken und index.html in einem aktuellen Desktop-Browser
öffnen. HTML, CSS, JavaScript und Bilder liegen im selben Ordner. Die App
benötigt weder einen Server noch eine Internetverbindung für diesen Start.
Ob eine Datei-Adresse ihre Daten dauerhaft speichern darf, hängt vom Browser
ab. Wenn der Browser lokalen Speicher blockiert, kannst du im aktuellen Tab
weiterarbeiten und die Änderungen als JSON sichern. Für die dauerhafte
Speicherung nutze GitHub Pages oder starte einen lokalen Webserver.

Mit installiertem Python kannst du im Ordner der App diesen Befehl ausführen:
  python -m http.server 8000 --bind 127.0.0.1
Dann http://localhost:8000/ öffnen.

ÜBER HTTPS AUF DEM HANDY (GITHUB PAGES)
1. Erstelle ein GitHub-Repository und lade den Inhalt dieses Ordners inklusive
   icons/ in die oberste Ebene des Hauptbranches (typischerweise main).
   index.html muss auf derselben Ebene liegen wie style.css und sw.js.
2. In Settings → Pages wähle als Source „Deploy from a branch“, danach main
   und / (root). Klicke auf Save. Aktiviere „Enforce HTTPS“, falls auswählbar.
3. Öffne die in Settings → Pages angezeigte HTTPS-Adresse auf dem Handy.
   Warte beim ersten Online-Aufruf, bis unter „Profile & Daten“ steht, dass
   die App für die Offline-Nutzung vorbereitet ist.
4. Optional im Browsermenü „App installieren“ oder „Zum Home-Bildschirm“
   wählen. Die Bezeichnung hängt von Gerät und Browser ab.

GitHub-Anleitung zur Veröffentlichung:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub-Anleitung zu HTTPS:
https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https

PROFILE UND SICHERUNGEN
Person 1 und Person 2 haben eigene Kleiderschränke, Looks und Studio-
Einstellungen. Unter „Profile & Daten“ kannst du Namen, Frisuren, Farben und
Körpermaße ändern, Beispielteile entfernen und beide Profile als JSON sichern.
Änderungen liegen im lokalen Speicher des jeweiligen Browsers für die
jeweilige Adresse. Für den Wechsel von der Datei-Adresse zu GitHub Pages,
einen Browserwechsel oder ein zweites Handy exportiere und importiere die
Sicherung. Der bestätigte Import ersetzt beide Profile.
Sicherungen der Versionen 1 bis 4 sind weiterhin lesbar. Alte Pullover werden
dabei in die neue Zwischenschicht einsortiert, auch in gespeicherten Looks.
Vor einem Import kannst du die bisherigen Daten aus dem Bestätigungsdialog
herunterladen.

SCHICHTEN UND ACCESSOIRES
Wähle ein Hemd unter „Oberteile“, einen Pullover unter „Pullover“ und eine
Jacke unter „Jacken“. Unter „Accessoires“ kannst du Tasche, Gürtel, Uhr und
Kette kombinieren und im selben Look speichern. Verwende beim Erfassen die
Passform, Grundfarbe und optional eine zweite Farbe für das Muster.
Bei Schuhen stellst du unter „Sohlenfarbe“ die Sohle unabhängig vom Obermaterial
ein. Die gezeichnete Vorschau und die Figur zeigen beide Farben.
Im Studio durchsucht das Suchfeld die gewählte Kategorie. „Rückgängig“
stellt das Outfit vor der letzten Outfit-Änderung in diesem Tab wieder her.

ANLASS, DRESSCODE UND LOOK BESTÄTIGEN
Wähle oben bei der Figur einen Anlass wie Office, Strand, Gala, Tagung,
Dinner oder Hochzeit. Der Dresscode wird dafür automatisch vorgeschlagen.
Du kannst ihn ändern und bei Bedarf das Wetter ergänzen. „Look vorschlagen“
kombiniert die vorhandenen Teile nach Anlass, Dresscode, Farben und Wetter.
„Neuer Look“ bevorzugt noch nicht gezeigte Kombinationen. Wenn die passenden
Varianten aufgebraucht sind, kann ein früherer Vorschlag wieder erscheinen.
Der Verlauf der letzten 36 Vorschläge und die Einstellungen bleiben pro
Profil gespeichert. Über „Teile fixieren“ behältst du bestimmte angezogene
Teile bei weiteren Vorschlägen.
„Look bestätigen“ öffnet die Übersicht mit den tatsächlich angezogenen
Kleidungsstücken, Schuhen und Accessoires. Das gilt auch für manuell
zusammengestellte Looks. Aus der Übersicht kannst du den Look in „Looks“
speichern und später mit seinem Anlass und Dresscode wieder anziehen.

KLEIDUNG AUS FOTOS ERFASSEN
Wähle im Studio oder im Schrank „Aus Foto“. Fotografiere ein einzelnes Teil
möglichst von vorn, gleichmäßig beleuchtet und vor einem ruhigen Hintergrund.
JPEG, PNG und WebP sind bis 10 MB möglich. Der Browser wertet das Bild lokal
aus und schlägt eine grobe Art, einen Farbton und gegebenenfalls eine zweite
Farbe oder gut erkennbare Streifen vor. Prüfe Schnitt und Farbe und ergänze
bei Bedarf Muster, Stil, Passform und Wetterschutz. Erst „Teil speichern“
legt den Eintrag an. Bei unklaren Fotos kannst du die Angaben selbst wählen.
Lass „Foto beim Kleidungsstück behalten“ aktiviert, um eine komprimierte
Vorschau mit bis zu 240 Pixeln im Browser zu speichern. Sie erscheint im
Studio und im Schrank und ist in der JSON-Sicherung enthalten. Das Foto wird
in IndexedDB gespeichert. Beim Bearbeiten kannst du es wieder entfernen.
Sicherungen mit Fotos dürfen bis zu 12 MB groß sein. Das Kleidungsmodell
und die Farbprobe funktionieren nach dem ersten Seitenaufruf auch offline.
Die Erkennung unterscheidet grobe Gruppen wie T-Shirt/Top, Hemd/Bluse,
Pullover, Hose, Jacke/Mantel, Sneaker, Boots und Tasche. Feine Schnitte,
Material, Maße und Wetterschutz sind manuell.

WETTER IM STUDIO
Unter der Figur kannst du Temperatur, Himmel, Niederschlag und Wind manuell
eintragen. Die Angaben gelten für das aktive Profil und bleiben gespeichert.
„Look vorschlagen“ ergänzt passend zum Wetter Schichten und kann deutlich
unpassende Teile austauschen. Unter „Teil hinzufügen“ bzw. beim Bearbeiten
kannst du Wärme und Wetterschutz angeben. Bei Regen werden als wasserabweisend
markierte Jacken und Schuhe bevorzugt. Die App lädt keine Wetterdaten.

VIRTUELLE ANPROBE
Die Anprobe verwendet das aktuelle Outfit und die Maße des aktiven Profils.
Wähle eine Schnittvorlage und optional ein lokales JPEG, PNG oder WebP.
Wähle mit einem Tipp ins Bild oder den Reglern einen Stoffausschnitt und
aktiviere „Bildmuster verwenden“, um ihn auf der 2D-Figur zu sehen. Schnitt,
Stofffall und Sitz sind vereinfacht.
Gib die Shopmaße als Umfang oder flache Breite ein. Die Rückenlänge einer
Jacke beeinflusst mit eingetragener Körpergröße den Saum der Vorschau.
Referenzbilder bleiben bis zum Neuladen im Browser-Tab. Beim Speichern
eines Teils werden Schnittdaten und Farbton übernommen. Die Einstellungen
und Maße der Anprobe bleiben während der Sitzung je Profil und Kategorie
erhalten.

ERWEITERN
index.html und style.css enthalten Oberfläche und Layout. data.js verwaltet
Kategorien, Schnitte, Farben, Beispieldaten, Stile und Bewertungsregeln.
weather.js bewertet Wärme und Wetterschutz für die manuell erfasste Lage.
look-planner.js kombiniert Anlass, Dresscode, Wetter und Vorschlagsverlauf.
drawing.js zeichnet Figuren und Kleidungsstücke mit Canvas. fitting.js
steuert die virtuelle Anprobe und den Maßvergleich. reference-image.js
prüft und verkleinert lokale Bilder. photo-recognition.js wertet Kleidungsfotos
mit photo-weights.js aus. photo-store.js verwaltet die Fotovorschauen in der
Browser-Datenbank. Modellherkunft und MIT-Lizenzen stehen in
LICENSE-FOTOERKENNUNG.txt. app.js steuert
Ansichten, Interaktionen, Speicherung und Import/Export. manifest.webmanifest
und sw.js machen die gehostete Version installierbar und offline nutzbar.
Erhöhe nach einer Änderung an den App-Dateien die Cache-Version in sw.js
und ergänze neue App-Dateien in assets. Geöffnete Tabs zeigen danach
„Update laden“ an. Aus älteren Versionen ohne Update-Knopf wechselst du,
indem du alle App-Tabs schließt und Kleiderstudio online erneut öffnest.
