export interface WeatherResult {
  tempC: number;
  condition: string;
  conditionEn: string;
}

const getCondition = (code: number): { tr: string; en: string } => {
  if (code === 0) return { tr: "açık", en: "clear" };
  if (code <= 3) return { tr: "parçalı bulutlu", en: "partly cloudy" };
  if (code <= 48) return { tr: "sisli", en: "foggy" };
  if (code <= 67) return { tr: "yağmurlu", en: "rainy" };
  if (code <= 77) return { tr: "karlı", en: "snowy" };
  if (code <= 82) return { tr: "sağanak yağışlı", en: "showery" };
  return { tr: "fırtınalı", en: "stormy" };
};

export const getWeather = async (
  lat: number,
  lon: number
): Promise<WeatherResult> => {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode` +
    `&timezone=auto`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    current: { temperature_2m: number; weathercode: number };
  };

  const code = data.current.weathercode;
  const tempC = Math.round(data.current.temperature_2m);
  const condition = getCondition(code);

  return {
    tempC,
    condition: condition.tr,
    conditionEn: condition.en,
  };
};
