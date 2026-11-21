/**
 * AUDIFY — Modern Minimalist Vinyl Music Application
 *
 * Features:
 * 1. Dynamic album cover gallery
 * 2. Infinite album cover marquee
 * 3. Vinyl artwork modal
 * 4. Download App modal
 * 5. Audio format selector
 * 6. YouTube playlist importing
 * 7. Track selection
 * 8. Select All functionality
 * 9. Selected track counter
 */

// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const galleryTrack = document.getElementById("album-gallery");
const collectionCount = document.getElementById("collection-count");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const formatBtn = document.getElementById("format-btn");
const formatDropdown = document.getElementById("format-dropdown");
const formatMenu = document.getElementById("format-menu");
const currentFormatSpan = document.getElementById("current-format");

const formatOptions = document.querySelectorAll(".format-option");

// Playlist selection elements
const selectAllCheckbox = document.getElementById("select-all-tracks");
const selectedCount = document.getElementById("selected-count");
const downloadSelectedBtn = document.getElementById("btn-download-selected");

// Modals
const sleeveModal = document.getElementById("sleeve-modal");
const modalCoverImg = document.getElementById("modal-cover-img");
const modalTitle = document.getElementById("modal-title");
const modalArtist = document.getElementById("modal-artist");
const modalClose = document.getElementById("modal-close");
const modalDownloadBtn = document.getElementById("modal-download-btn");

const downloadAppModal = document.getElementById("download-app-modal");
const btnDownloadApp = document.getElementById("btn-download-app");
const downloadModalClose = document.getElementById("download-modal-close");

// Toast
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

let toastTimeout = null;


// ==========================================
// 2. APPLICATION STATE
// ==========================================

let selectedFormat = "MP3 (320 kbps)";
let activeCoverUrl = "";

let loadedCovers = [];

// Stores indexes of selected tracks
let selectedTracks = new Set();

// Stores the currently imported playlist
let currentPlaylistTracks = [];


// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================

function formatFileName(url) {

    try {

        const decoded = decodeURIComponent(url);

        const filename = decoded
            .split("/")
            .pop()
            .replace(/\.[^/.]+$/, "");

        if (filename.toLowerCase().includes("whatsapp")) {
            return "Curated Studio Edition";
        }

        return filename;

    } catch {

        return "Vinyl Master Cut";

    }
}


// ==========================================
// 4. TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 3800);

}


// ==========================================
// 5. ALBUM COVER GALLERY
// ==========================================

async function loadAlbumCovers() {

    if (!galleryTrack) return;

    try {

        const response = await fetch("/api/covers");

        if (!response.ok) {

            throw new Error(`HTTP error: ${response.status}`);

        }

        const covers = await response.json();

        if (!Array.isArray(covers) || covers.length === 0) {

            galleryTrack.innerHTML = `
                <p style="color: var(--text-muted); padding: 20px;">
                    No album covers found in collection.
                </p>
            `;

            return;

        }

        loadedCovers = covers;

        if (collectionCount) {

            collectionCount.textContent =
                `${covers.length} VINYL PRESSINGS`;

        }

        const heightClasses = [
            "card-tall",
            "card-compact",
            "card-mid",
            "card-square"
        ];

        galleryTrack.innerHTML = "";

        // Duplicate images for infinite scrolling
        const duplicatedCovers = [...covers, ...covers];

        duplicatedCovers.forEach((coverUrl, index) => {

            const card = document.createElement("div");

            const heightClass =
                heightClasses[index % heightClasses.length];

            card.className = `album-card ${heightClass}`;

            const img = document.createElement("img");

            img.src = coverUrl;

            img.alt = `Vinyl Album Cover ${index + 1}`;

            img.loading = "lazy";

            img.decoding = "async";

            card.appendChild(img);

            galleryTrack.appendChild(card);
        });

    } catch (error) {

        console.error("Album gallery error:", error);

        galleryTrack.innerHTML = `
            <p style="color: var(--rust-btn); padding: 20px;">
                Unable to load album covers.
            </p>
        `;

    }

}


// ==========================================
// 6. VINYL ARTWORK MODAL
// ==========================================

function openSleeveModal(coverUrl, index) {

    if (!sleeveModal || !modalCoverImg) return;

    activeCoverUrl = coverUrl;

    modalCoverImg.src = coverUrl;

    const readableName = formatFileName(coverUrl);

    if (modalTitle) {

        modalTitle.textContent =
            `${readableName} #${index + 1}`;

    }

    if (modalArtist) {

        modalArtist.textContent =
            `Audify Vault • ${selectedFormat}`;

    }

    sleeveModal.classList.add("open");

    sleeveModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}


function closeSleeveModal() {

    if (!sleeveModal) return;

    sleeveModal.classList.remove("open");

    sleeveModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


// ==========================================
// 7. DOWNLOAD APP MODAL
// ==========================================

function openAppModal() {

    if (!downloadAppModal) return;

    downloadAppModal.classList.add("open");

    downloadAppModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}


function closeAppModal() {

    if (!downloadAppModal) return;

    downloadAppModal.classList.remove("open");

    downloadAppModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


// ==========================================
// 8. AUDIO FORMAT SELECTOR
// ==========================================

if (formatBtn && formatDropdown) {

    formatBtn.addEventListener("click", (event) => {

        event.stopPropagation();

        const isOpen =
            formatDropdown.classList.toggle("open");

        if (formatMenu) {

            formatMenu.classList.toggle("show", isOpen);

        }

        formatBtn.setAttribute("aria-expanded", isOpen);

    });


    formatOptions.forEach(option => {

        option.addEventListener("click", (event) => {

            event.stopPropagation();

            formatOptions.forEach(item => {

                item.classList.remove("active");

            });

            option.classList.add("active");

            selectedFormat =
                option.getAttribute("data-value") ||
                "MP3 (320 kbps)";

            if (currentFormatSpan) {

                currentFormatSpan.textContent = selectedFormat;

            }

            formatDropdown.classList.remove("open");

            if (formatMenu) {

                formatMenu.classList.remove("show");

            }

            formatBtn.setAttribute("aria-expanded", "false");

            showToast(`Audio format set to ${selectedFormat}`);

        });

    });


    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {

        if (!formatDropdown.contains(event.target)) {

            formatDropdown.classList.remove("open");

            if (formatMenu) {

                formatMenu.classList.remove("show");

            }

            formatBtn.setAttribute("aria-expanded", "false");

        }

    });

}


// ==========================================
// 9. TRACK SELECTION SYSTEM
// ==========================================

function updateSelectionUI() {

    const totalTracks = currentPlaylistTracks.length;

    const selectedTotal = selectedTracks.size;

    // Update selected count
    if (selectedCount) {

        selectedCount.textContent =
            `${selectedTotal} selected`;

    }

    // Enable / disable download button
    if (downloadSelectedBtn) {

        downloadSelectedBtn.disabled =
            selectedTotal === 0;

    }

    // Update Select All checkbox
    if (selectAllCheckbox) {

        selectAllCheckbox.checked =
            totalTracks > 0 &&
            selectedTotal === totalTracks;

        selectAllCheckbox.indeterminate =
            selectedTotal > 0 &&
            selectedTotal < totalTracks;

    }

}


// ==========================================
// 10. SELECT ALL TRACKS
// ==========================================

function handleSelectAll() {

    if (!selectAllCheckbox) return;

    const checkboxes =
        document.querySelectorAll(".track-checkbox");

    if (selectAllCheckbox.checked) {

        currentPlaylistTracks.forEach((track, index) => {

            selectedTracks.add(index);

        });

    } else {

        selectedTracks.clear();

    }

    checkboxes.forEach((checkbox, index) => {

        checkbox.checked =
            selectedTracks.has(index);

    });

    updateSelectionUI();

}


// ==========================================
// 11. INDIVIDUAL TRACK SELECTION
// ==========================================

function createTrackCheckbox(index) {

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.className = "track-checkbox";

    checkbox.setAttribute(
        "aria-label",
        `Select track ${index + 1}`
    );

    checkbox.addEventListener("change", () => {

        if (checkbox.checked) {

            selectedTracks.add(index);

        } else {

            selectedTracks.delete(index);

        }

        updateSelectionUI();

    });

    return checkbox;

}


// ==========================================
// 12. PLAYLIST IMPORT HANDLER
// ==========================================

async function handleSearch() {

    const url = searchInput
        ? searchInput.value.trim()
        : "";

    if (!url) {

        showToast("Please paste a playlist URL.");

        return;

    }

    const results =
        document.getElementById("playlist-results");

    const trackList =
        document.getElementById("track-list");

    const playlistName =
        document.getElementById("playlist-name");

    const playlistCount =
        document.getElementById("playlist-count");


    showToast("Importing your playlist...");


    try {

        const response = await fetch(
            "/api/playlists/import",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    url: url

                })

            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Playlist import failed."
            );

        }


        const playlist = data.playlist;


        // Reset previous selection
        selectedTracks.clear();

        currentPlaylistTracks =
            Array.isArray(playlist.tracks)
                ? playlist.tracks
                : [];


        if (selectAllCheckbox) {

            selectAllCheckbox.checked = false;

            selectAllCheckbox.indeterminate = false;

        }


        // Playlist title
        if (playlistName) {

            playlistName.textContent =
                playlist.playlist_name || "Imported Playlist";

        }


        // Playlist count
        if (playlistCount) {

            playlistCount.textContent =
                `${currentPlaylistTracks.length} TRACKS FOUND`;

        }


        // Clear previous playlist
        if (trackList) {

            trackList.innerHTML = "";


            currentPlaylistTracks.forEach((track, index) => {

                // Track row
                const row = document.createElement("div");

                row.className = "track-row";


                // 1. Selection checkbox
                const checkbox =
                    createTrackCheckbox(index);


                // 2. Track number
                const number = document.createElement("span");

                number.className = "track-number";

                number.textContent =
                    String(index + 1).padStart(2, "0");


                // 3. Artwork wrapper
                const artworkWrap =
                    document.createElement("div");

                artworkWrap.className =
                    "track-artwork-wrap";


                // Artwork image
                const artwork =
                    document.createElement("img");

                artwork.className = "track-artwork";

                artwork.alt =
                    track.title
                        ? `${track.title} artwork`
                        : `Track ${index + 1} artwork`;

                artwork.loading = "lazy";

                artwork.referrerPolicy = "no-referrer";


                // Thumbnail URL
                let thumbUrl = track.thumbnail;

                if (!thumbUrl && track.id) {

                    thumbUrl =
                        `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;

                } else if (
                    thumbUrl &&
                    thumbUrl.startsWith("//")
                ) {

                    thumbUrl = "https:" + thumbUrl;

                }


                // Artwork fallback
                artwork.onerror = function () {

                    if (
                        track.id &&
                        !this.src.includes("mqdefault.jpg")
                    ) {

                        this.src =
                            `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;

                    } else if (
                        track.id &&
                        !this.src.includes("/0.jpg")
                    ) {

                        this.src =
                            `https://img.youtube.com/vi/${track.id}/0.jpg`;

                    } else {

                        this.onerror = null;

                        this.src =
                            "/static/images/Vinyl.png";

                    }

                };


                artwork.src =
                    thumbUrl ||
                    (track.id
                        ? `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`
                        : "/static/images/Vinyl.png");


                artworkWrap.appendChild(artwork);


                // 4. Track details
                const details =
                    document.createElement("div");

                details.className = "track-details";


                const title =
                    document.createElement("h4");

                title.className = "track-title";

                title.textContent =
                    track.title || "Unknown Track";

                title.title =
                    track.title || "";


                const artist =
                    document.createElement("p");

                artist.className = "track-artist";

                artist.textContent =
                    track.artist || "Unknown Artist";

                artist.title =
                    track.artist || "";


                details.append(title, artist);


                // 5. Format badge
                const metaRight =
                    document.createElement("div");

                metaRight.className =
                    "track-meta-right";


                const badge =
                    document.createElement("span");

                badge.className = "track-badge";

                badge.textContent =
                    selectedFormat.split(" ")[0] || "MP3";


                metaRight.appendChild(badge);


                // Assemble track row
                row.append(
                    checkbox,
                    number,
                    artworkWrap,
                    details,
                    metaRight
                );


                trackList.appendChild(row);

            });

        }


        // Update selection counter
        updateSelectionUI();


        // Show playlist results
        if (results) {

            results.hidden = false;

            showToast(
                `Successfully imported ${currentPlaylistTracks.length} tracks!`
            );

            results.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }


    } catch (error) {

        console.error("Playlist import error:", error);

        showToast(
            error.message || "Failed to import playlist."
        );

    }

}

// ==========================================
// 13. DOWNLOAD MANAGER
// ==========================================

async function handleDownloadSelected() {

    if (selectedTracks.size === 0) {
        showToast("Please select at least one track.");
        return;
    }

    const selectedTrackData = [...selectedTracks].map(
        index => currentPlaylistTracks[index]
    );

    const total = selectedTrackData.length;

    // Create download manager
    let manager = document.getElementById("download-manager");

    if (!manager) {

        manager = document.createElement("section");

        manager.id = "download-manager";

        manager.style.cssText = `
            margin: 25px 0;
            padding: 24px;
            background: #fffaf3;
            border: 1px solid #eaded0;
            border-radius: 14px;
        `;

        const trackList = document.getElementById("track-list");

        trackList.parentElement.insertBefore(manager, trackList);
    }

    manager.innerHTML = `
        <h3 style="margin-bottom:8px;">Download Manager</h3>

        <p id="download-summary" style="color:#946b58;">
            Preparing ${total} tracks...
        </p>

        <div style="
            height:8px;
            background:#eaded0;
            border-radius:20px;
            overflow:hidden;
            margin:16px 0;
        ">
            <div id="download-progress-fill" style="
                width:0%;
                height:100%;
                background:#96351c;
                transition:width .3s ease;
            "></div>
        </div>

        <div id="download-items"></div>
    `;

    manager.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

    const itemsContainer = document.getElementById("download-items");

    const summary = document.getElementById("download-summary");

    const progressFill = document.getElementById("download-progress-fill");

    if (downloadSelectedBtn) {
        downloadSelectedBtn.disabled = true;
        downloadSelectedBtn.textContent = "Downloading...";
    }

    let completed = 0;
    let failed = 0;

    // Create individual download rows
    const downloadRows = selectedTrackData.map((track, index) => {

        const row = document.createElement("div");

        row.style.cssText = `
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            padding:13px 0;
            border-bottom:1px solid #eaded0;
        `;

        const title = document.createElement("span");

        title.textContent = `${index + 1}. ${track.title || "Unknown Track"}`;

        title.style.cssText = `
            font-weight:500;
            min-width:0;
            overflow-wrap:anywhere;
        `;

        const status = document.createElement("span");

        status.textContent = "Waiting";

        status.style.cssText = `
            color:#946b58;
            font-size:13px;
            white-space:nowrap;
        `;

        row.append(title, status);

        itemsContainer.appendChild(row);

        return status;
    });

    // Update overall progress
    function updateProgress() {

        const processed = completed + failed;

        const percentage = Math.round(
            (processed / total) * 100
        );

        progressFill.style.width = `${percentage}%`;

        summary.textContent =
            `${processed} of ${total} tracks processed · ${completed} completed · ${failed} failed`;
    }

    // Download each selected track
    try {

        for (let i = 0; i < total; i++) {

            const track = selectedTrackData[i];

            const status = downloadRows[i];

            status.textContent = "Downloading...";

            status.style.color = "#b36b20";

            summary.textContent =
                `Downloading track ${i + 1} of ${total}: ${track.title}`;

            try {

                let songUrl = track.url;

                if (!songUrl || !songUrl.startsWith("http")) {

                    songUrl =
                        `https://www.youtube.com/watch?v=${track.id || songUrl}`;

                }

                const response = await fetch("/api/download", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        url: songUrl
                    })

                });

                const data = await response.json();

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.error || "Download failed"
                    );

                }

                completed++;

                status.textContent = "✓ Completed";

                status.style.color = "#287a42";

                console.log("Download completed:", data.song);

            } catch (error) {

                failed++;

                status.textContent = "✕ Failed";

                status.style.color = "#b3261e";

                status.title = error.message;

                // Show actual error below the track
                const errorMessage = document.createElement("p");

                errorMessage.textContent = error.message;

                errorMessage.style.cssText = `
        color: #b3261e;
        font-size: 12px;
        margin-top: 5px;
        overflow-wrap: anywhere;
    `;

                status.parentElement.appendChild(errorMessage);

                console.error(`Download failed: ${track.title}`, error);

            }
            updateProgress();
        }

        summary.textContent =
            `Finished! ${completed} downloaded, ${failed} failed out of ${total}.`;

        showToast(
            `${completed} downloads completed. ${failed} failed.`
        );

    } finally {

        if (downloadSelectedBtn) {

            downloadSelectedBtn.disabled =
                selectedTracks.size === 0;

            downloadSelectedBtn.innerHTML =
                "↓ Download Selected";

        }

    }
}
// ==========================================
// 14. APPLICATION EVENT LISTENERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {


    // Load album covers
    loadAlbumCovers();


    // Playlist search form
    if (searchForm) {

        searchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            handleSearch();

        });

    }


    // Select all tracks
    if (selectAllCheckbox) {

        selectAllCheckbox.addEventListener(
            "change",
            handleSelectAll
        );

    }


    // Download selected tracks
    if (downloadSelectedBtn) {

        downloadSelectedBtn.addEventListener(
            "click",
            handleDownloadSelected
        );

    }


    // Download App button
    if (btnDownloadApp) {

        btnDownloadApp.addEventListener(
            "click",
            openAppModal
        );

    }


    // Close Download App modal
    if (downloadModalClose) {

        downloadModalClose.addEventListener(
            "click",
            closeAppModal
        );

    }


    // Close artwork modal
    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeSleeveModal
        );

    }


    // Modal Download button
    if (modalDownloadBtn) {

        modalDownloadBtn.addEventListener("click", () => {

            showToast(
                `Artwork and metadata: ${selectedFormat}`
            );

            closeSleeveModal();

        });

    }


    // Close modals on backdrop click
    [sleeveModal, downloadAppModal].forEach(modal => {

        if (!modal) return;

        modal.addEventListener("click", (event) => {

            if (event.target === modal) {

                closeSleeveModal();

                closeAppModal();

            }

        });

    });


    // Escape key closes modals
    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeSleeveModal();

            closeAppModal();

        }

    });


    // Navbar scroll spy
    const sections =
        document.querySelectorAll("main section, footer");

    const navLinks =
        document.querySelectorAll(".nav-link");


    window.addEventListener("scroll", () => {

        let currentSectionId = "home";

        const scrollPosition =
            window.scrollY + 200;


        sections.forEach(section => {

            const sectionTop = section.offsetTop;

            const sectionHeight = section.offsetHeight;


            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight
            ) {

                currentSectionId =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");

            if (
                link.getAttribute("href") ===
                `#${currentSectionId}`
            ) {

                link.classList.add("active");

            }

        });

    }, { passive: true });


    // Initial selection state
    updateSelectionUI();

});