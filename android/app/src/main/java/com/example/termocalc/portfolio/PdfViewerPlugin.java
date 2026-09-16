package com.example.termocalc.portfolio;

import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.util.Locale;

@CapacitorPlugin(name = "PdfViewer")
public class PdfViewerPlugin extends Plugin {
    @PluginMethod
    public void open(PluginCall call) {
        String value = call.getString("uri");
        if (value == null) {
            call.reject("Informe o arquivo PDF.", "INVALID_FILE");
            return;
        }
        try {
            Uri source = Uri.parse(value);
            if (!"file".equals(source.getScheme()) || source.getPath() == null) {
                call.reject("Arquivo PDF inválido.", "INVALID_FILE");
                return;
            }
            File file = new File(source.getPath()).getCanonicalFile();
            File reports = new File(Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_DOCUMENTS), "TermoCalcPortfolio").getCanonicalFile();
            if (!file.getPath().startsWith(reports.getPath() + File.separator)
                || !file.getName().toLowerCase(Locale.ROOT).endsWith(".pdf") || !file.isFile()) {
                call.reject("Relatório não encontrado.", "INVALID_FILE");
                return;
            }
            Uri uri = FileProvider.getUriForFile(getContext(),
                getContext().getPackageName() + ".fileprovider", file);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/pdf");
            intent.setClipData(ClipData.newRawUri(file.getName(), uri));
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException error) {
            call.reject("Nenhum visualizador de PDF instalado.", "NO_PDF_VIEWER", error);
        } catch (Exception error) {
            call.reject("Não foi possível abrir o PDF.", "OPEN_FAILED", error);
        }
    }
}

