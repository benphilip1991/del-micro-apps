<ons-page id="mymaps_prev">
    <ons-toolbar>
        <div class="left">
            <ons-back-button>Back</ons-back-button>
        </div>
        <div class="center">Summary</div>
    </ons-toolbar>
    <section>
        <ons-row>
            <div id="map-box-old" class="map-container1"></div>
        </ons-row>
        <div class="section">
            <h4><span id="summary-timestamp"></span></h4>
        </div>

        <!-- Workout Highlights -->
        <ons-row>
            <ons-col style="padding:5px; width:50%">
                <div class="data-box">
                    <span>Total Time : <span id="total-time-workout">--</span></span>
                </div>
            </ons-col>
            <ons-col style="padding:5px; width:50%">
                <div class="data-box">
                    <span>Distance : <span id="distance-workout">--</span></span>
                </div>
            </ons-col>
        </ons-row>
        <ons-row>
            <ons-col style="padding:5px; width:50%">
                <div class="data-box">
                    <span>Total Steps : <span id="step-count-workout">--</span></span>
                </div>
            </ons-col>
            <ons-col style="padding:5px; width:50%">
                <div class="data-box">
                    <span>Avg. HR : <span id="heart-rate-workout">--</span> bpm</span>
                </div>
            </ons-col>
        </ons-row>

        <!-- Heart rate chart -->
        <ons-list>
            <ons-list-item expandable>
                <div class="section">
                    <h5>Heart Rate</h5>
                </div>
                <div class="expandable-content">
                    <br>
                    <canvas id="hr-chart"></canvas>
                </div>
            </ons-list-item>
        </ons-list>

    </section>
</ons-page>