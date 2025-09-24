import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar,
  Activity,
  Shield
} from "lucide-react";

/**
 * Reports Dashboard - Central location for all reports
 * Provides access to all generated reports across QSHE and Security modules
 */
export default function Reports() {
  const reportCategories = [
    {
      title: "QSHE Reports",
      icon: Activity,
      reports: [
        {
          name: "Safety Metrics Report",
          description: "Monthly safety performance report",
          lastGenerated: "2024-01-15",
          format: "PDF",
          size: "2.3 MB"
        },
        {
          name: "Rikes & NAPZA Summary",
          description: "Health examination attendance report",
          lastGenerated: "2024-01-10",
          format: "Excel", 
          size: "1.8 MB"
        },
        {
          name: "Medical Onsite Reports",
          description: "Compiled medical reports",
          lastGenerated: "2024-01-08",
          format: "PDF",
          size: "4.1 MB"
        }
      ]
    },
    {
      title: "Security Reports", 
      icon: Shield,
      reports: [
        {
          name: "Security Metrics Report",
          description: "Monthly security incident report",
          lastGenerated: "2024-01-15",
          format: "PDF",
          size: "1.9 MB"
        },
        {
          name: "BUJP Performance Report",
          description: "Security service provider report",
          lastGenerated: "2024-01-12",
          format: "PDF",
          size: "3.2 MB"
        },
        {
          name: "Visitor Management Report",
          description: "VMS activity and statistics",
          lastGenerated: "2024-01-14",
          format: "Excel",
          size: "950 KB"
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Laporan & Dokumentasi</h1>
        <p className="text-muted-foreground mt-1">
          Akses semua laporan QSHE dan Security yang telah dibuat
        </p>
      </div>

      <div className="space-y-8">
        {reportCategories.map((category) => (
          <Card key={category.title} className="surface-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <category.icon className="h-5 w-5" />
                <span>{category.title}</span>
              </CardTitle>
              <CardDescription>
                Laporan dan dokumentasi terkait {category.title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.reports.map((report, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <FileText className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className="text-xs">
                        {report.format}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">{report.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Generated: {report.lastGenerated}</span>
                      </div>
                      <div>Size: {report.size}</div>
                    </div>
                    
                    <Button size="sm" className="w-full" variant="outline">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}