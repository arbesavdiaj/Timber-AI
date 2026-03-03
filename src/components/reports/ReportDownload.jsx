import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, FileText, File, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import jsPDF from "jspdf";

export default function ReportDownload({ report }) {
  const [downloading, setDownloading] = useState(false);

  const { data: zones = [] } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list(),
    initialData: [],
  });

  const generatePDF = async () => {
    setDownloading(true);
    try {
      const reportZones = zones.filter((z) =>
        report.zones_included?.includes(z.id),
      );

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Helper to add new page if needed
      const checkPageBreak = (increment = 10) => {
        if (y + increment > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Title
      pdf.setFillColor(45, 106, 79);
      pdf.rect(0, 0, pageWidth, 30, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, "bold");
      pdf.text("TIMBER AI", margin, 15);
      pdf.setFontSize(12);
      pdf.text("Forest Management Report", margin, 23);

      y = 40;
      pdf.setTextColor(0, 0, 0);

      // Report Title
      pdf.setFontSize(16);
      pdf.setFont(undefined, "bold");
      pdf.text(report.title, margin, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated: ${format(new Date(report.created_date), "MMMM d, yyyy 'at' h:mm a")}`,
        margin,
        y,
      );
      y += 5;
      pdf.text(
        `Type: ${report.report_type.replace("_", " ").toUpperCase()}`,
        margin,
        y,
      );
      y += 15;

      // Executive Summary
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("EXECUTIVE SUMMARY", margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      const summaryLines = pdf.splitTextToSize(
        report.summary,
        pageWidth - 2 * margin,
      );
      summaryLines.forEach((line) => {
        checkPageBreak();
        pdf.text(line, margin, y);
        y += 5;
      });
      y += 10;

      // Key Metrics
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("KEY METRICS", margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      const metrics = [
        `Total Acres: ${report.metrics?.total_acres?.toLocaleString() || "N/A"}`,
        `Average Health Score: ${report.metrics?.avg_health_score || "N/A"}/100`,
        `Total Carbon: ${report.metrics?.total_carbon?.toLocaleString() || "N/A"} tons/year`,
        `High-Risk Zones: ${report.metrics?.risk_zones || 0}`,
      ];

      if (report.metrics?.weather_readings) {
        metrics.push(`Weather Data Points: ${report.metrics.weather_readings}`);
      }
      if (report.metrics?.sensor_count) {
        metrics.push(
          `IoT Sensors: ${report.metrics.online_sensors}/${report.metrics.sensor_count} online`,
        );
      }

      metrics.forEach((metric) => {
        checkPageBreak();
        pdf.text(`• ${metric}`, margin + 5, y);
        y += 6;
      });
      y += 10;

      // Zones Covered
      if (reportZones.length > 0) {
        checkPageBreak(20);
        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("ZONES COVERED", margin, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");

        reportZones.forEach((zone) => {
          checkPageBreak(25);
          pdf.setFont(undefined, "bold");
          pdf.text(`• ${zone.name}`, margin + 5, y);
          y += 6;

          pdf.setFont(undefined, "normal");
          pdf.setTextColor(80, 80, 80);
          pdf.text(
            `Area: ${zone.area_acres?.toLocaleString()} acres`,
            margin + 10,
            y,
          );
          y += 5;
          pdf.text(
            `Health: ${zone.health_score}/100 | Fire Risk: ${zone.fire_risk}`,
            margin + 10,
            y,
          );
          y += 5;
          pdf.text(
            `Carbon: ${zone.carbon_sequestration?.toLocaleString()} tons/year`,
            margin + 10,
            y,
          );
          y += 8;
          pdf.setTextColor(0, 0, 0);
        });
        y += 5;
      }

      // Recommendations
      checkPageBreak(20);
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("RECOMMENDATIONS", margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");

      if (report.recommendations && report.recommendations.length > 0) {
        report.recommendations.forEach((rec, i) => {
          checkPageBreak(15);
          const recLines = pdf.splitTextToSize(
            `${i + 1}. ${rec}`,
            pageWidth - 2 * margin - 10,
          );
          recLines.forEach((line) => {
            checkPageBreak();
            pdf.text(line, margin + 5, y);
            y += 5;
          });
          y += 3;
        });
      } else {
        pdf.text("No recommendations available", margin + 5, y);
        y += 6;
      }

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages} | TimberAI Forest Intelligence Platform`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
      }

      // Save PDF
      pdf.save(
        `${report.title.replace(/[^a-z0-9]/gi, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
    setDownloading(false);
  };

  const generateCSV = async () => {
    setDownloading(true);
    try {
      const reportZones = zones.filter((z) =>
        report.zones_included?.includes(z.id),
      );

      // Build CSV content
      const csvContent = [
        ["Timber AI Forest Report - Data Export"],
        ["Report Title", report.title],
        [
          "Generated",
          format(new Date(report.created_date), "yyyy-MM-dd HH:mm:ss"),
        ],
        [""],
        ["Zone Data"],
        [
          "Zone Name",
          "Area (acres)",
          "Health Score",
          "Canopy Density",
          "Fire Risk",
          "Pest Risk",
          "Carbon Sequestration",
        ],
        ...reportZones.map((z) => [
          z.name,
          z.area_acres,
          z.health_score,
          z.canopy_density,
          z.fire_risk,
          z.pest_risk,
          z.carbon_sequestration,
        ]),
        [""],
        ["Summary Metrics"],
        ["Metric", "Value"],
        ["Total Acres", report.metrics?.total_acres || 0],
        ["Average Health Score", report.metrics?.avg_health_score || 0],
        ["Total Carbon Sequestration", report.metrics?.total_carbon || 0],
        ["High-Risk Zones", report.metrics?.risk_zones || 0],
        [""],
        ["Recommendations"],
        ...(report.recommendations?.map((rec) => [rec]) || []),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Failed to export CSV. Please try again.");
    }
    setDownloading(false);
  };

  const exportFormat = report.report_config?.export_format || "pdf";

  if (exportFormat === "both" || !exportFormat) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full rounded-xl border-[#40916C]/30 text-[#2D6A4F] hover:bg-[#40916C]/10 gap-2"
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={generatePDF}>
            <FileText className="w-4 h-4 mr-2" />
            Download as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={generateCSV}>
            <File className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full rounded-xl border-[#40916C]/30 text-[#2D6A4F] hover:bg-[#40916C]/10 gap-2"
      onClick={exportFormat === "csv" ? generateCSV : generatePDF}
      disabled={downloading}
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download {exportFormat === "csv" ? "CSV" : "PDF"}
        </>
      )}
    </Button>
  );
}
