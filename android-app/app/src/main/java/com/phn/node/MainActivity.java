package com.phn.node;

import android.os.Bundle;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private TextView nodeStatus;
    private TextView rewardBalance;
    private TextView lastHeartbeat;
    private TextView uptimeText;
    private ProgressBar uptimeBar;
    private boolean walletConnected = false;
    private boolean verified = false;
    private boolean running = false;
    private int accrued = 0;
    private int uptime = 0;
    private int heartbeats = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        nodeStatus = findViewById(R.id.nodeStatus);
        rewardBalance = findViewById(R.id.rewardBalance);
        lastHeartbeat = findViewById(R.id.lastHeartbeat);
        uptimeText = findViewById(R.id.uptimeText);
        uptimeBar = findViewById(R.id.uptimeBar);

        Button connectWalletButton = findViewById(R.id.connectWalletButton);
        Button registerButton = findViewById(R.id.registerButton);
        Button startNodeButton = findViewById(R.id.startNodeButton);
        Button heartbeatButton = findViewById(R.id.heartbeatButton);
        Button claimButton = findViewById(R.id.claimButton);

        connectWalletButton.setOnClickListener(v -> {
            walletConnected = true;
            nodeStatus.setText("Wallet connected");
        });

        registerButton.setOnClickListener(v -> {
            if (!walletConnected) {
                nodeStatus.setText("Connect wallet first");
                return;
            }
            verified = true;
            nodeStatus.setText("Device verified");
        });

        startNodeButton.setOnClickListener(v -> {
            if (!verified) {
                nodeStatus.setText("Verify this device first");
                return;
            }
            running = true;
            nodeStatus.setText("Node running");
        });

        heartbeatButton.setOnClickListener(v -> {
            if (!running) {
                nodeStatus.setText("Start node first");
                return;
            }
            heartbeats += 1;
            accrued += 1;
            uptime = Math.min(100, uptime + 10);
            rewardBalance.setText("Rewards: " + accrued + " PHN");
            lastHeartbeat.setText("Last heartbeat: just now");
            uptimeBar.setProgress(uptime);
            uptimeText.setText("Uptime score: " + uptime + "%");
        });

        claimButton.setOnClickListener(v -> {
            if (accrued == 0) return;
            accrued = 0;
            rewardBalance.setText("Rewards: 0 PHN");
        });
    }
}
