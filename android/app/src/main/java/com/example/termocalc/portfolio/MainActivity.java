package com.example.termocalc.portfolio;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PdfViewerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

