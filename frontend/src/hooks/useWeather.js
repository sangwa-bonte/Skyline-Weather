import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { weatherApi, historyApi } from '../services/api'

export function useCurrentWeather(city) {
  return useQuery({
    queryKey: ['weather', 'current', city],
    queryFn: () => weatherApi.getCurrent(city),
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
  })
}

export function useForecast(city) {
  return useQuery({
    queryKey: ['weather', 'forecast', city],
    queryFn: () => weatherApi.getForecast(city),
    enabled: !!city,
    staleTime: 1000 * 60 * 10,
  })
}

export function useSearchHistory(limit = 20) {
  return useQuery({
    queryKey: ['history', limit],
    queryFn: () => historyApi.getAll(limit),
    staleTime: 0,
  })
}

export function useDeleteHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => historyApi.deleteEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  })
}

export function useClearHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => historyApi.clearAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  })
}
