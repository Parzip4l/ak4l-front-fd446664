import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SafetyPyramidProps {
  data: {
    fatality: number;
    lost_time_injuries: number;
    illness: number;
    medical_treatment_cases: number;
    first_aid_cases: number;
    property_damage: number;
    near_miss: number;
    unsafe_action: number;
    unsafe_condition: number;
    work_hours: number;
    safety_inspection: boolean;
    emergency_drill: boolean;
    incident_investigation: boolean;
    internal_audit: boolean;
    p2k3_meeting: boolean;
    safety_awareness: boolean;
  };
}

/**
 * Safety Pyramid Visualization Component
 * Displays safety incidents in hierarchical pyramid structure
 * with safety activities checklist below
 */
export default function SafetyPyramid({ data }: SafetyPyramidProps) {
  const pyramidLevels = [
    { 
      name: "Fatality", 
      value: data.fatality, 
      color: "bg-red-500", 
      width: "w-16" 
    },
    { 
      name: "Lost Time Injuries", 
      value: data.lost_time_injuries, 
      color: "bg-orange-600", 
      width: "w-24" 
    },
    { 
      name: "Illness", 
      value: data.illness, 
      color: "bg-orange-500", 
      width: "w-32" 
    },
    { 
      name: "Medical Treatment Cases (MTC)", 
      value: data.medical_treatment_cases, 
      color: "bg-orange-400", 
      width: "w-40" 
    },
    { 
      name: "First Aid Cases (FAC)", 
      value: data.first_aid_cases, 
      color: "bg-orange-300", 
      width: "w-48" 
    },
    { 
      name: "Property Damage", 
      value: data.property_damage, 
      color: "bg-yellow-500", 
      width: "w-56" 
    },
    { 
      name: "Near Miss", 
      value: data.near_miss, 
      color: "bg-yellow-400", 
      width: "w-64" 
    },
    { 
      name: "Unsafe Action", 
      value: data.unsafe_action, 
      color: "bg-yellow-300", 
      width: "w-72" 
    },
    { 
      name: "Unsafe Condition", 
      value: data.unsafe_condition, 
      color: "bg-green-400", 
      width: "w-80" 
    }
  ];

  const safetyActivities = [
    { 
      name: "Inspeksi Keselamatan", 
      value: data.safety_inspection, 
      key: "safety_inspection" 
    },
    { 
      name: "Audit Internal Keselamatan", 
      value: data.internal_audit, 
      key: "internal_audit" 
    },
    { 
      name: "Simulasi Tanggap Darurat", 
      value: data.emergency_drill, 
      key: "emergency_drill" 
    },
    { 
      name: "Rapat P2K3", 
      value: data.p2k3_meeting, 
      key: "p2k3_meeting" 
    },
    { 
      name: "Investigasi Insiden Keselamatan", 
      value: data.incident_investigation, 
      key: "incident_investigation" 
    },
    { 
      name: "Awareness Keselamatan", 
      value: data.safety_awareness, 
      key: "safety_awareness" 
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="surface-1">
        <CardHeader>
          <CardTitle>Safety Pyramid</CardTitle>
          <CardDescription>
            Hierarki insiden keselamatan berdasarkan tingkat keparahan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-2">
            {/* Work Hours Display */}
            <div className="mb-6 text-right self-end">
              <div className="text-sm text-muted-foreground">Jumlah Jam Kerja</div>
              <div className="text-2xl font-bold">{data.work_hours.toLocaleString()}</div>
            </div>

            {/* Pyramid Structure */}
            <div className="relative">
              {pyramidLevels.map((level, index) => (
                <div key={level.name} className="flex items-center justify-center mb-1">
                  <div className={`
                    ${level.color} ${level.width} h-12 
                    flex items-center justify-between px-4 text-white text-sm font-medium
                    rounded-sm shadow-sm
                  `}>
                    <span className="text-lg font-bold">{level.value}</span>
                  </div>
                  <div className="ml-4 text-sm font-medium min-w-[200px]">
                    {level.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Activities */}
      <Card className="surface-1">
        <CardHeader>
          <CardTitle>Aktivitas Keselamatan</CardTitle>
          <CardDescription>
            Status pelaksanaan aktivitas keselamatan bulan ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyActivities.map((activity) => (
              <div key={activity.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">{activity.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">:</span>
                  <Badge 
                    variant={activity.value ? "success" : "secondary"}
                    className="min-w-[40px] justify-center"
                  >
                    {activity.value ? "1" : "0"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}