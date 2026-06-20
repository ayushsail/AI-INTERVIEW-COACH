"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Edit2, Plus, Trash2, Award, Briefcase, BookOpen, Settings } from "lucide-react";

interface ProfileSummaryProps {
  parsedData: {
    skills: string[];
    projects: Array<{ name: string; description: string; technologies: string[] }>;
    experience: Array<{ role: string; company: string; duration: string; description: string }>;
    education: Array<{ degree: string; institution: string; year: string }>;
    toolsAndTech: string[];
    targetRoleHints: string;
  };
  onConfirm: (finalData: any) => void;
}

export default function ProfileSummary({ parsedData, onConfirm }: ProfileSummaryProps) {
  const [data, setData] = useState(parsedData);
  const [newSkill, setNewSkill] = useState("");
  const [newTool, setNewTool] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData({ ...data, skills: [...data.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  const handleAddTool = () => {
    if (newTool.trim() && !data.toolsAndTech.includes(newTool.trim())) {
      setData({ ...data, toolsAndTech: [...data.toolsAndTech, newTool.trim()] });
      setNewTool("");
    }
  };

  const handleRemoveTool = (tool: string) => {
    setData({ ...data, toolsAndTech: data.toolsAndTech.filter((t) => t !== tool) });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Profile</h2>
        <p className="text-muted-foreground">We parsed the following details from your resume. Feel free to refine them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Experience & Education */}
        <div className="space-y-6">
          <Card className="border-muted bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Briefcase className="w-5 h-5 mr-2 text-primary" />
              <CardTitle className="text-lg">Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-primary/20 pl-4 py-1 space-y-1">
                  <h4 className="font-semibold text-sm">{exp.role}</h4>
                  <p className="text-xs text-muted-foreground">{exp.company} • {exp.duration}</p>
                  <p className="text-xs text-muted-foreground/80 line-clamp-2">{exp.description}</p>
                </div>
              ))}
              {data.experience.length === 0 && (
                <p className="text-xs text-muted-foreground">No experience details parsed.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-muted bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              <CardTitle className="text-lg">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {data.education.map((edu, idx) => (
                <div key={idx} className="border-l-2 border-secondary pl-4 py-1">
                  <h4 className="font-semibold text-sm">{edu.degree}</h4>
                  <p className="text-xs text-muted-foreground">{edu.institution} ({edu.year})</p>
                </div>
              ))}
              {data.education.length === 0 && (
                <p className="text-xs text-muted-foreground">No education details parsed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Skills, Tools, Projects */}
        <div className="space-y-6">
          <Card className="border-muted bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Award className="w-5 h-5 mr-2 text-primary" />
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 inline-flex items-center justify-center text-primary/70 hover:text-primary"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add Skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="text-xs h-8"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <Button size="sm" variant="outline" onClick={handleAddSkill} className="h-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              <CardTitle className="text-lg">Tools & Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {data.toolsAndTech.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-muted-foreground/20"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="ml-1.5 inline-flex items-center justify-center text-muted-foreground/75 hover:text-muted-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add Tool/Tech"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  className="text-xs h-8"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTool()}
                />
                <Button size="sm" variant="outline" onClick={handleAddTool} className="h-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-semibold text-sm">Suggested Target Roles</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{data.targetRoleHints}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onConfirm(data)} className="px-6 py-4 shadow-lg hover:shadow-xl transition-all">
          <Check className="w-4 h-4 mr-2" />
          Confirm Profile & Proceed
        </Button>
      </div>
    </div>
  );
}
