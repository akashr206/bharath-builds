"use client";

import React, { useEffect, useRef, useState } from 'react';
import TextNavigationUI from '@/components/TextNavigationUI.jsx';
import useNavigationStore from '@/store/useNavigationStore.js';
import useLocalizationStore from '@/store/useLocalizationStore.js';
import { useVoiceStore, useVoice } from '@/hooks/useVoice.js';
import { useRouter } from 'next/navigation';
import { GraduationCap, Landmark, Bus, FileText, Volume2, Search } from 'lucide-react';
import { fetchAllSchemas } from '@/lib/apiService.js';
import { apiFetch } from '@/lib/api.js';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';

// Color and icon mapping for specific forms
const getFormStyling = (formId) => {
  switch (formId) {
    case 'national_scholarship':
      return { color: 'text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground', icon: GraduationCap };
    case 'education_loan':
      return { color: 'text-secondary bg-secondary/10 hover:bg-secondary hover:text-secondary-foreground', icon: Landmark };
    case 'bus_pass':
      return { color: 'text-accent bg-accent/10 hover:bg-accent hover:text-accent-foreground', icon: Bus };
    default:
      return { color: 'text-foreground bg-muted hover:bg-foreground hover:text-background', icon: FileText };
  }
};

export default function HomePage() {
  const { setPage, setSystemMessage, language, setAvailableForms } = useNavigationStore();
  const { interactionMode } = useVoiceStore();
  const { playSystemAudio, pauseListening } = useVoice();
  const t = useLocalizationStore(state => state.t);
  const router = useRouter();

  const [forms, setForms] = useState([]);
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);

  const isVoiceMode = interactionMode === 'voice';
  const hasGreetedRef = useRef(false);

  useEffect(() => {
    setPage('home');

    // Fetch available forms from backend
    const fetchData = async () => {
      try {
        const data = await fetchAllSchemas();
        setForms(data);
        const formTitles = (data || []).map(f => f.title);
        setAvailableForms(formTitles);

        const infoRes = await apiFetch("/api/information");
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setInfos(infoData);
        }

        if (isVoiceMode && !hasGreetedRef.current) {
          hasGreetedRef.current = true;
          pauseListening(false);

          if (language && language !== 'English') {
            await useLocalizationStore.getState().fetchDictionary(language);
          }

          let welcomeText = `Welcome to Parallax! You can apply for: ${formTitles.join(", ")}. Which one do you want to open?`;
          setSystemMessage(welcomeText);

          setTimeout(async () => {
            try {
              await playSystemAudio("welcome_home");
              window.dispatchEvent(new Event('start-voice-turn'));
            } catch (e) {
              if (e.message !== "INTERRUPTED") {
                console.warn("Autoplay prevented or audio failed:", e);
                window.dispatchEvent(new Event('start-voice-turn'));
              }
            }
          }, 100);
        } else if (!isVoiceMode) {
          setSystemMessage("");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setPage, setSystemMessage, isVoiceMode, language, playSystemAudio, setAvailableForms]);

  return (
    <main className={`min-h-screen bg-background flex flex-col items-center justify-start pt-6 md:pt-16 p-4 md:p-8 ${isVoiceMode ? 'pb-[380px] md:pb-[420px]' : 'pb-16'}`}>
      <div className="max-w-[1100px] w-full flex flex-col items-start md:items-center text-left md:text-center space-y-6">

        {/* Header Section */}
        <div className="w-full mb-10 flex flex-col md:items-center">

          <h1 className="text-4xl md:text-5xl text-foreground font-extrabold tracking-tight mb-4">
            Service Dashboard
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-3xl">
            Select a service application below, or check the information board for updates.
          </p>
        </div>

        {loading ? (
          <div className="w-full mt-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <p className="text-xl font-bold text-muted-foreground font-mono">Fetching services...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-16">

            {/* Forms Grid */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">Available Services</h2>
                <div className="hidden md:flex items-center gap-2 text-muted-foreground font-mono text-sm">
                  <Search className="w-4 h-4" />
                  <span>{forms.length} records found</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {forms.map((form) => {
                  const { color, icon: Icon } = getFormStyling(form.formId);
                  return (
                    <Card
                      key={form.formId}
                      className="group flex flex-col text-left cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      onClick={() => {
                        if (isVoiceMode) {
                          setSystemMessage(`Opening the ${form.title}.`);
                        }
                        router.push(`/form/${form.formId}`);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/form/${form.formId}`);
                          }
                      }}
                      aria-label={`Open ${form.title}`}
                    >
                      <CardContent className="p-8 flex flex-col flex-1 h-full">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 transition-colors ${color}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                          <span className="text-sm font-bold font-mono text-muted-foreground mb-2 block uppercase tracking-wider">
                            Application
                          </span>
                          <h2 className="text-2xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {form.title}
                          </h2>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Information Board */}
            {infos.length > 0 && (
              <div className="w-full">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-3xl font-bold text-foreground">Information Board</h2>
                  <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-mono text-xs font-bold">
                    {infos.length} Updates
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {infos.map((info, idx) => {
                    const title = info.title[language || "English"] || info.title["English"];
                    const content = info.content[language || "English"] || info.content["English"];
                    const audioUrl = info.audioUrls?.[language || "English"];

                    return (
                      <Card key={idx} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-8 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
                          <div className="flex-1 space-y-4">
                            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-4xl">{content}</p>
                          </div>
                          {audioUrl && (
                            <Button
                              size="lg"
                              onClick={() => {
                                const audio = new Audio(`http://localhost:8080${audioUrl}`);
                                audio.play();
                              }}
                              className="shrink-0 rounded-full font-bold text-lg px-8 h-14 flex items-center gap-3 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                              aria-label={`Listen to ${title}`}
                            >
                              Listen <Volume2 className="w-6 h-6" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice & Assistant are ONLY rendered on Home Page in No-Touch Mode */}
      {isVoiceMode && <TextNavigationUI isHomeVoiceOnly={true} />}
    </main>
  );
}
