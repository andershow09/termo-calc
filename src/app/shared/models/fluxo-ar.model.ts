export interface ResultCalc {
  areaAbertura: number;
  entalpiaInfilt: number;
  entalpiaRef: number;
  densidadeInfilt: number;
  densidadeRef: number;
  fm: number;
  fluxoCaloKcal: number;
  fluxoCalorKw: number;
  consumo: number;
  custoHora: number;
  custoDia: number;
  custoMes: number;
  custoAno: number;
}

export interface InputCalc {
  temperaturaInf: number;
  umidadeInf: number;
  temperaturaRef: number;
  umidadeRef: number;
  larguraAbert: number;
  alturaAbert: number;
  tempoAbert: number;
  cop: number;
  custoKw: number;
  eficienciaCort: number;
  acelaracaoGravitacional: number;
  altitude: number;
}

export const DEFAULT_INPUT_CALC: InputCalc = {
  temperaturaInf: 15,
  umidadeInf: 50,
  temperaturaRef: -15,
  umidadeRef: 50,
  larguraAbert: 3,
  alturaAbert: 3,
  tempoAbert: 15,
  cop: 5,
  custoKw: 1,
  eficienciaCort: 30,
  acelaracaoGravitacional: 9.80665,
  altitude: 0,
};
