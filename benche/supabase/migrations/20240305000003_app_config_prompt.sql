-- Backend'den değiştirilebilir: prompt, max_recommendations, vb.
-- Placeholder'lar: {{language}}, {{city}}, {{country}}, {{countryCode}}, {{weather}}, {{weatherTemp}}, {{season}}, {{color}}, {{symbol}}, {{element}}, {{letter}}, {{number}}, {{liked}}, {{disliked}}

-- Prompt template: {{placeholders}} ile değiştirilir
insert into public.app_config (key, value)
values (
  'prompt_template',
  to_jsonb(
    'Act as Benche, a cool daily lifestyle guide. Generate exactly 6 personalized recommendations in JSON format.

User context:
- Language: {{language}}
- Location: {{city}}, {{country}} ({{countryCode}})
- Weather: {{weather}}, {{weatherTemp}}°C
- Season: {{season}}
- Selections: color={{color}}, symbol={{symbol}}, element={{element}}, letter={{letter}}, number={{number}}
- Liked (avoid similar): {{liked}}
- Disliked (never suggest): {{disliked}}

Rules:
- Food: from {{country}} cuisine or locally available
- Playlist: accessible on Spotify/YouTube in {{countryCode}}
- Film/Series: available in {{language}}
- Book: available in {{language}}
- Activity: doable in {{city}} with {{weather}} weather in {{season}}

Return ONLY valid JSON array, no markdown:
[
  {"category":"Yemek","title":"...","description":"...","reason":"...","link":"optional url"},
  {"category":"Playlist","title":"...","description":"...","reason":"..."},
  {"category":"Film","title":"...","description":"...","reason":"..."},
  {"category":"Series","title":"...","description":"...","reason":"..."},
  {"category":"Kitap","title":"...","description":"...","reason":"..."},
  {"category":"Aktivite","title":"...","description":"...","reason":"..."}
]'::text
  )
)
on conflict (key) do nothing;

insert into public.app_config (key, value)
values ('max_recommendations', to_jsonb(6))
on conflict (key) do nothing;

-- output_categories: JSON array, model çıktısında beklenen kategori sırası
insert into public.app_config (key, value)
values (
  'output_categories',
  '["Yemek","Playlist","Film","Series","Kitap","Aktivite"]'::jsonb
)
on conflict (key) do nothing;
