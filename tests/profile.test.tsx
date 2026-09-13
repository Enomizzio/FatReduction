import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { defaultProfile, parseDecimal, profileSchema } from '../src/domain/profile'
import { initializeProfile, openDatabase, saveProfile } from '../src/storage/database'
import { ProfileForm } from '../src/features/ProfileForm'

describe('Profilo', () => {
  it('rifiuta limiti, slot duplicati e numeri ambigui', () => {
    const p = defaultProfile()
    expect(profileSchema.safeParse(p).success).toBe(true)
    for (const ageYears of [17, 121, 30.5, NaN]) expect(profileSchema.safeParse({ ...p, ageYears }).success).toBe(false)
    expect(profileSchema.safeParse({ ...p, mealSlots: [p.mealSlots[0], p.mealSlots[0]] }).success).toBe(false)
    expect(parseDecimal('92,5')).toBe(92.5)
    for (const value of ['', '1.000,5', '1e2', '-3', 'Infinity']) expect(parseDecimal(value)).toBeNaN()
  })
  it('inizializza una sola volta, persiste dopo riapertura e rileva conflitti', async () => {
    const name = crypto.randomUUID()
    const [first, second] = await Promise.all([initializeProfile(name), initializeProfile(name)])
    expect(first).toEqual(second)
    const saved = await saveProfile({ ...first, ageYears: 43, mealSlots: first.mealSlots.slice(0, 3) }, first.updatedAt, name)
    expect(await initializeProfile(name)).toEqual(saved)
    await expect(saveProfile(first, first.updatedAt, name)).rejects.toThrow('altra scheda')
    const db = await openDatabase(name)
    expect(db.version).toBe(1)
    expect(await db.count('profiles')).toBe(1)
    db.close()
  })
  it('conserva input su quota esaurita, consente riprovare e rifiuta input invalidi', async () => {
    const user = userEvent.setup()
    const persist = vi.fn().mockRejectedValueOnce(new DOMException('quota', 'QuotaExceededError')).mockImplementation(async p => p)
    render(<ProfileForm profile={defaultProfile()} onSaved={vi.fn()} persist={persist} />)
    const age = screen.getByLabelText('Età (anni)')
    await user.clear(age); await user.type(age, '12'); await user.click(screen.getByRole('button', { name: 'Salva profilo' }))
    expect(persist).not.toHaveBeenCalled()
    expect(age).toHaveAttribute('aria-invalid', 'true')
    await user.clear(age); await user.type(age, '43'); await user.click(screen.getByRole('button', { name: 'Salva profilo' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Spazio del browser esaurito')
    expect(age).toHaveValue('43')
    await user.click(screen.getByRole('button', { name: 'Salva profilo' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Profilo salvato')
  })
})
