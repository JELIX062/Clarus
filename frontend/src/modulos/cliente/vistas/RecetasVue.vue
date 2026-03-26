<template>
    <section class="recetas-view">
        <header class="header">
        <div>
            <h2>{{ tituloVista }}</h2>
        </div>
        <button v-if="!esDoctor" class="button" type="button" @click="showDialog = true">Solicitar renovación</button>
        </header>

        <div class="filters">
        <input
            v-model.trim="searchTerm"
            class="input"
            type="search"
            placeholder="Buscar por doctor"
        />
        <select v-model="selectedStatus" class="input select">
            <option value="Todas">Todos los estados</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
            </option>
        </select>
        </div>

        <div class="recipes-grid">
        <article v-for="prescription in filteredPrescriptions" :key="prescription.id" class="recipe-card">
            <div class="card-top">
            <h3>{{ prescription.medicine }}</h3>
            <span class="tag" :class="statusClass[prescription.status]">{{ prescription.status }}</span>
            </div>
            <p class="meta">👨‍⚕️ {{ prescription.doctor }} · 📅 Emitida: {{ prescription.issueDate }}</p>
            <p class="line"><strong>Dosis:</strong> {{ prescription.dose }}</p>
            <p class="line"><strong>Frecuencia:</strong> {{ prescription.frequency }}</p>
            <p class="line"><strong>Duración:</strong> {{ prescription.durationDays }} días</p>
            <p class="line"><strong>Vence:</strong> {{ prescription.expirationDate }}</p>
            <p class="line"><strong>Refills disponibles:</strong> {{ prescription.refillsLeft }}</p>
            <p class="description"><strong>Indicaciones:</strong> {{ prescription.instructions }}</p>
        </article>

        <div v-if="filteredPrescriptions.length === 0" class="empty-state">
            No se encontraron recetas con los filtros seleccionados.
        </div>
        </div>

        <div v-if="showDialog" class="dialog-backdrop" @click.self="closeDialog">
        <div class="dialog">
            <h3>Solicitar renovación de receta</h3>
            <form class="form" @submit.prevent="saveRenewalRequest">
            <label for="medicine">Medicamento</label>
            <input
                id="medicine"
                v-model.trim="renewalForm.medicine"
                class="input"
                type="text"
                maxlength="80"
                placeholder="Ej: Losartán"
            />

            <label for="reason">Motivo</label>
            <select id="reason" v-model="renewalForm.reason" class="input select">
                <option disabled value="">Selecciona un motivo</option>
                <option v-for="reason in reasonOptions" :key="reason" :value="reason">{{ reason }}</option>
            </select>

            <label for="notes">Notas para el médico</label>
            <textarea
                id="notes"
                v-model.trim="renewalForm.notes"
                class="input textarea"

                rows="3"
                placeholder="Ej: Me quedan 3 tabletas"
            ></textarea>

            <div class="actions">
                <button class="button button-white" type="button" @click="closeDialog">Cancelar</button>
                <button class="button" type="submit">Enviar solicitud</button>
            </div>
            </form>
        </div>
        </div>

        <div v-if="renewalRequests.length > 0" class="requests-panel">
        <h3>Solicitudes enviadas</h3>
        <ul class="request-list">
            <li v-for="request in renewalRequests" :key="request.id" class="request-item">
            <strong>{{ request.medicine }}</strong> · {{ request.reason }} · {{ request.date }}
            </li>
        </ul>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed, reactive, ref } from 'vue'
    import { useSesion } from '@/modulos/principal/controladores/useSesion'

    type PrescriptionStatus = 'Vigente' | 'Por vencer' | 'Vencida'

    type Prescription = {
    id: string
    medicine: string
    doctor: string
    dose: string
    frequency: string
    durationDays: number
    issueDate: string
    expirationDate: string
    refillsLeft: number
    instructions: string
    status: PrescriptionStatus
    }

    type RenewalReason = 'Sin dosis disponibles' | 'Receta vencida' | 'Pérdida de receta'

    type RenewalRequest = {
    id: string
    medicine: string
    reason: RenewalReason
    notes: string
    date: string
    }

    const statusOptions: PrescriptionStatus[] = ['Vigente', 'Por vencer', 'Vencida']
    const reasonOptions: RenewalReason[] = ['Sin dosis disponibles', 'Receta vencida', 'Pérdida de receta']

    const statusClass: Record<PrescriptionStatus, string> = {
    Vigente: 'status-active',
    'Por vencer': 'status-warning',
    Vencida: 'status-stopped'
    }

    const prescriptions = ref<Prescription[]>([])
    const { rolUsuario } = useSesion()

    const renewalRequests = ref<RenewalRequest[]>([])
    const searchTerm = ref('')
    const selectedStatus = ref<'Todas' | PrescriptionStatus>('Todas')
    const showDialog = ref(false)

    const renewalForm = reactive<{
    medicine: string
    reason: '' | RenewalReason
    notes: string
    }>({
    medicine: '',
    reason: '',
    notes: ''
    })

    const filteredPrescriptions = computed(() => {
    const term = searchTerm.value.toLowerCase()

    return prescriptions.value.filter((prescription) => {
        const matchesStatus = selectedStatus.value === 'Todas' || prescription.status === selectedStatus.value
        const matchesSearch = prescription.medicine.toLowerCase().includes(term)

        return matchesStatus && matchesSearch
    })
    })

    const esDoctor = computed(() => rolUsuario.value === 'doctor')
    const tituloVista = computed(() => (esDoctor.value ? 'Expedientes médicos' : 'Mis recetas médicas'))

    function closeDialog() {
    showDialog.value = false
    renewalForm.medicine = ''
    renewalForm.reason = ''
    renewalForm.notes = ''
    }

    function saveRenewalRequest() {
    if (!renewalForm.medicine || !renewalForm.reason) {
        return
    }

    renewalRequests.value.unshift({
        id: crypto.randomUUID(),
        medicine: renewalForm.medicine,
        reason: renewalForm.reason,
        notes: renewalForm.notes,
        date: new Date().toISOString().slice(0, 10)
    })

    closeDialog()
    }
</script>

<style scoped>
    .recetas-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
    }

    h2,
    h3,
    p {
    margin: 0;
    }

    .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    }

    .subtitle {
    margin-top: 0.35rem;
    color: var(--clarus-oxford);
    }

    .button {
    border: 1px solid var(--clarus-midnight);
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    font-weight: 700;
    cursor: pointer;
    }

    .button-white {
    background: var(--clarus-ivory);
    color: var(--clarus-midnight);
    }

    .filters {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.85rem;
    }

    .recipes-grid {
    display: grid;
    gap: 1rem;
    }

    .recipe-card,
    .empty-state,
    .requests-panel,
    .dialog {
    background: var(--clarus-ivory);
    border-radius: 20px;
    padding: 1.25rem;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    }

    .request-list {
    margin: 0.75rem 0 0;
    padding-left: 1.1rem;
    color: var(--clarus-oxford);
    }

    .request-item {
    margin-bottom: 0.4rem;
    }

    .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    }

    .tag {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 700;
    }

    .status-active {
    background: #dcfce7;
    color: #15803d;
    }

    .status-warning {
    background: #fef3c7;
    color: #a16207;
    }

    .status-stopped {
    background: #fee2e2;
    color: #b91c1c;
    }

    .meta,
    .line,
    .description {
    margin-top: 0.5rem;
    color: var(--clarus-oxford);
    }

    .input {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    color: var(--clarus-midnight);
    min-height: 46px;
    }

    .input:focus {
    outline: 2px solid var(--clarus-gold);
    outline-offset: 1px;
    }

    .select,
    .textarea {
    width: 100%;
    }

    .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(26, 43, 60, 0.55);
    display: grid;
    place-items: center;
    padding: 1rem;
    z-index: 20;
    }

    .dialog {
    width: min(520px, 100%);
    }

    .form {
    display: grid;
    gap: 0.65rem;
    margin-top: 0.75rem;
    }

    .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 0.35rem;
    }

    @media (max-width: 760px) {
    .filters {
        grid-template-columns: 1fr;
    }

    .header,
    .actions {
        flex-direction: column;
        align-items: flex-start;
    }
    }
</style>